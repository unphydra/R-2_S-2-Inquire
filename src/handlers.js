const request = require('superagent');

const isLoggedIn = function (req, res, next) {
  const { id } = req.session;
  if (!id) {
    return res.status('401').json({error: 'Your are not logged in'});
  }
  next();
};

const checkOptions = function (...args) {
  return function (req, res, next) {
    const hasOptions = args.every((arg) => req.body[arg]);
    if (!hasOptions) {
      return res.status('400').send('bad request');
    }
    next();
  };
};

const serveLoginPage = function(req, res) {
  res.render('loginPage');
};

const reqLogin = function (req, res) {
  const { ClientID } = req.app.locals;
  const redirectUri = 'http://localhost:8000/user/auth';
  const route = 'https://github.com/login/oauth/authorize';
  const url = `${route}?client_id=${ClientID}&redirect_uri=${redirectUri}`;
  res.redirect(url);
};

const getToken = function (code, ClientSecret, ClientID) {
  return request
    .post('https://github.com/login/oauth/access_token')
    .send({ code, ['client_secret']: ClientSecret, ['client_id']: ClientID })
    .set('Accept', 'application/json')
    .then((res) => res.body)
    .then((data) => data.access_token);
};

const getUserInfo = function (token) {
  return request
    .get('https://api.github.com/user')
    .set('User-Agent', 'r2s2-inquire')
    .set('Authorization', `token ${token}`)
    .then((res) => res.body);
};

const fetchUserDetails = async function (req, res, next) {
  const { ClientID, ClientSecret } = req.app.locals;
  const code = req.query.code;
  const token = await getToken(code, ClientSecret, ClientID).catch(
    (err) => {
      err;
    }
  );
  if (!token) {
    return res.status('400').send('bad request');
  }
  const userInfo = await getUserInfo(token).catch((err) => err);
  if (!userInfo.id) {
    return res.status('400').send('bad request');
  }
  req.userInfo = userInfo;
  next();
};

const handleLogin = async function (req, res) {
  const { userInfo, app } = req;
  const { dataStore } = app.locals;
  req.session = {
    id: userInfo.id,
    avatar: userInfo['avatar_url'],
    time: new Date().toJSON()
  };
  const isRegisteredUser = await dataStore.findUser(userInfo.id);
  if (isRegisteredUser) {
    return res.redirect('/');
  }
  res.render('newProfile');
};

const cancelRegistration = function (req, res) {
  req.session = null;
  res.redirect('/');
};

const serveQuestions = async (req, res) => {
  const { dataStore } = req.app.locals;
  const { id } = req.session;
  const userInfo = await dataStore.findUser(id);
  res.render('home', {userInfo, userId: id, questions: req.questions});
};

const serveHomepage = async (req, res, next) => {
  const { dataStore } = req.app.locals;
  req.questions = await dataStore.getAllQuestions();
  next();
};

const serveYourQuestionsPage = async function (req, res, next) {
  const { dataStore } = req.app.locals;
  req.questions = await dataStore.getAllQuestions(req.session.id);
  next();
};

const serveYourAnswersPage = async (req, res, next) => {
  const { dataStore } = req.app.locals;
  req.questions = await dataStore.getAllAnsweredQuestions(req.session.id);
  next();
};

const serveQuestionPage = async (req, res) => {
  const { id } = req.params;
  const { dataStore } = req.app.locals;
  const userInfo = await dataStore.findUser(req.session.id);
  try {
    const questionDetails = await dataStore.getQuestionDetails(id);
    const ownerInfo = await dataStore.findUser(
      questionDetails.ownerId.slice('1')
    );
    return res.render('questionPage', {
      userInfo,
      userId: req.session.id,
      questionDetails,
      ownerInfo
    });
  } catch (err) {
    return res
      .status('400')
      .render('questionPage', { userId: req.session.id, userInfo }); 
  }
};

const servePostQuestionPage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const { id } = req.session;
  const userInfo = await dataStore.findUser(id);
  res.render('postQuestion', { userId: id, userInfo });
};

const serveProfilePage = async function (req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status('400').send('bad request');
  }
  const { dataStore } = req.app.locals;
  const userId = req.session.id;
  const userInfo = await dataStore.findUser(userId);
  const details = await dataStore.findUser(id);
  res.render('profilePage', {details, userId, userInfo});
};

const registerNewUser = async function (req, res) {
  const { dataStore } = req.app.locals;
  const { id, avatar } = req.session;
  await dataStore.addNewUser({ id, avatar, ...req.body });
  res.redirect('/');
};

const formatBody = function(response) {
  let text = response;
  text = text.replace(/\n/g, '<br/>');
  text = text.replace(/"/g, '\'');
  return text;
};

const postQuestion = async function(req, res){
  const {dataStore} = req.app.locals;
  const { id } = req.session;
  const { title, body, tags } = req.body;
  const tagList = tags.split(' ');
  const questionId = await dataStore.insertQuestion(
    id, 
    title, 
    formatBody(body)
  );
  await dataStore.insertTags(questionId, tagList);
  res.redirect(`/question/${questionId}`);
};

const postAnswer = async function (req, res) {
  const { questionId } = req.params;
  const { dataStore } = req.app.locals;
  const { id } = req.session;
  const questionDetails = await dataStore.getRow('questions', questionId);
  if (!questionDetails) {
    return res.status('400').send('bad request');
  }
  await dataStore.insertAnswer(questionId, id, formatBody(req.body.answer));
  res.redirect(`/question/${questionId}`);
};

const postComment = async function (req, res) {
  const { id } = req.session;
  const { dataStore } = req.app.locals;
  const { questionId, resId } = req.params;
  const tables = { 'q': 'questions', 'a': 'answers' };
  const row = await dataStore.getRow(tables[resId.slice('0', '1')], resId);
  if (!row) {
    return res.status('400').send('bad request');
  }
  await dataStore.saveComment(id, resId, req.body.comment);
  res.redirect(`/question/${questionId}`);
};

const updateComment = async function(req, res) {
  const { id } = req.session;
  const { dataStore } = req.app.locals;
  const { comment, commentId } = req.body;
  const row = await dataStore.getRow('comments', commentId);
  if(!row) {
    return res.status('400').send('bad request');
  }
  if(id !== +row.ownerId.slice('1')) {
    return res.status('405').json({error: 'Your are not comment owner'});
  }
  const status = await dataStore.updateComment(commentId, comment);
  res.json(status);
};

const acceptAnswer = async function(req, res) {
  const { id } = req.session;
  const { dataStore } = req.app.locals;
  const { questionId, answerId } = req.params;
  const row = await dataStore.getRow('questions', questionId);
  if (!row) {
    return res.status('400').send('bad request');
  }
  if(id !== +row.ownerId.slice('1')) {
    return res.status('405').json({error: 'Your are not question owner'});
  }
  const status = await dataStore.acceptAnswer(questionId, answerId);
  res.json(status);
};

const getCredential = function(url) {
  const [, action] = url.split('/');
  const zero = 0, one = 1, negativeOne = -1;
  const isUpVote = action === 'upVote' ? one : zero;
  const delta = isUpVote ? one : negativeOne;
  return {delta, isUpVote};
};

const getUpdateVoteDetails = async function(req, res, next) {
  const {id} = req.session;
  const {dataStore} = req.app.locals;
  const {type, resId} = req.params;
  const {delta, isUpVote} = getCredential(req.url);
  const log = await dataStore.getVoteLog(id, resId);
  const isInValid = log && log.vote === isUpVote;
  req.details = {id, dataStore, type, resId, delta, isUpVote, log, isInValid};
  next();
};

const updateVote = async function(req, res){
  const {
    id, dataStore, type, resId, delta, isUpVote, log, isInValid
  } = req.details;
  try {
    if (isInValid) {
      return res.json({});
    }
    await dataStore.updateResponseVote(type, resId, delta);
    if(!log){
      await dataStore.insertToVoteLog(id, resId, isUpVote);
    } else {
      await dataStore.deleteVoteLog(id, resId);
    }
    return res.json(await dataStore.getVoteCount(type, resId));
  } catch (error) {
    return res.status('400').send('bad request');
  }
};

module.exports = {
  isLoggedIn,
  checkOptions,
  serveLoginPage,
  reqLogin,
  fetchUserDetails,
  handleLogin,
  cancelRegistration,
  serveQuestions,
  serveHomepage,
  serveYourQuestionsPage,
  serveYourAnswersPage,
  serveQuestionPage,
  servePostQuestionPage,
  serveProfilePage,
  registerNewUser,
  postQuestion,
  postAnswer,
  postComment,
  updateComment,
  acceptAnswer,
  getUpdateVoteDetails,
  updateVote
};
