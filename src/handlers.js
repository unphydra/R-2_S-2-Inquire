const request = require('superagent');
const knexDataStore = require('../library/knexDataStore');

const isLoggedIn = function (req, res, next) {
  const { id } = req.session;
  if (!id) {
    return res.status('401').json({error: 'Your are not logged in'});
  }
  next();
};

const checkOptions = function (...args) {
  return function (req, res, next) {
    const hasOptions = args.every(([val, type]) => 
      req.body[val] && req.body[val].constructor === type
    );
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
  const { userInfo} = req;
  req.session = {
    id: userInfo.id,
    avatar: userInfo['avatar_url'],
    time: new Date().toJSON()
  };
  const [isRegisteredUser] = await knexDataStore.getUser(userInfo.id);
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
  const { id } = req.session;
  const [userInfo] = await knexDataStore.getUser(id);
  res.render(req.view, {userInfo, questions: req.questions});
};

const serveHomepage = async (req, res, next) => {
  req.questions = await knexDataStore.getAllQuestions();
  req.view = 'home';
  next();
};

const serveYourQuestionsPage = async function (req, res, next) {
  req.questions = await knexDataStore.getYourQuestions(req.session.id);
  req.view = 'yourQuestions';
  next();
};

const serveYourAnswersPage = async (req, res, next) => {
  req.questions = await knexDataStore.allQuestionsYouAnswered(req.session.id);
  req.view = 'yourAnswers';
  next();
};

const serveQuestionPage = async (req, res) => {
  const { id } = req.params;
  const [userInfo] = await knexDataStore.getUser(req.session.id);
  try {
    const questionDetails = await knexDataStore.getQuestionDetails(+id);
    return res.render('questionPage', { userInfo, questionDetails });
  } catch (err) {
    return res
      .status('400')
      .render('questionPage', { userInfo }); 
  }
};

const servePostQuestionPage = async function(req, res) {
  const { id } = req.session;
  const userInfo = await knexDataStore.getUser(id);
  const allTags = await knexDataStore.getAllTags();
  res.render('postQuestion', { userInfo, allTags });
};

const serveEditQuestionPage = async function(req, res) {
  const { questionId } = req.params;
  const [userInfo] = await knexDataStore.getUser(req.session.id);
  try {
    const allTags = await knexDataStore.getAllTags();
    const [questionDetails] = await knexDataStore.getYourQuestionDetails(
      +questionId, req.session.id
    );
    res.render('editQuestion', 
      {userInfo, allTags, questionDetails}
    );
  }catch(error){
    res.status('400').send('bad request');
  }
};

const serveProfilePage = async function (req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status('400').send('no user found');
  }
  const [userInfo] = await knexDataStore.getUser(req.session.id);
  const [details] = await knexDataStore.getUser(id);
  return res.render('profilePage', {details, userInfo});
};

const registerNewUser = async function (req, res) {
  const { id, avatar } = req.session;
  await knexDataStore.addNewUser({ id, avatar, ...req.body });
  res.redirect('/');
};

const formatBody = function(response) {
  let text = response;
  text = text.replace(/\n/g, '<br/>');
  text = text.replace(/"/g, '\'');
  return text;
};

const postQuestion = async function(req, res) {
  const { title, body, tags } = req.body;
  const questionId = await knexDataStore.insertNewQuestion(
    {ownerId: req.session.id, title, body: formatBody(body)},
    tags
  );
  res.redirect(`/question/${questionId}`);
};

const updateQuestion = async function(req, res) {
  const { title, body, tags } = req.body;
  try {
    await knexDataStore.updateQuestion( 
      {
        id: +req.params.questionId, 
        ownerId: req.session.id, 
        title, 
        body: formatBody(body)
      },
      tags
    );
    return res.redirect(`/question/${req.params.questionId}`);
  } catch (error) {
    res.status('400').send('not found');
  }
};

const postAnswer = async function (req, res) {
  try {
    await knexDataStore.insertNewAnswer(
      {
        ownerId: req.session.id,
        questionId: +req.params.questionId,
        answer: formatBody(req.body.answer)
      }
    );
    return res.redirect(`/question/${req.params.questionId}`);
  } catch (error) {
    res.status('400').send('not found');
  }
};

const updateAnswer = async function(req, res) {
  const { answer, answerId, questionId} = req.body;
  try {
    await knexDataStore.updateAnswer({
      id: answerId,
      ownerId: req.session.id,
      answer: formatBody(answer)
    });
    return res.redirect(`/question/${questionId}`);
  } catch (error) {
    res.status('400').send('not found');
  }
};

const postComment = async function (req, res) {
  const {questionId, type } = req.params;
  const {responseId, comment} = req.body;
  const tables = { questions: 1, answers: 0 };
  try {
    await knexDataStore.insertNewComment(
      {
        ownerId: req.session.id,
        responseId,
        comment,
        type: tables[type]
      },
      type
    );
    return res.redirect(`/question/${questionId}`);
  } catch (error) {
    return res.status('400').send('bad request');
  }

};

const updateComment = async function(req, res) {
  const { comment, commentId } = req.body;
  try {
    await knexDataStore.updateComment(
      {
        id: commentId,
        ownerId: req.session.id,
        comment
      }
    );
    return res.redirect(`/question/${req.params.questionId}`);
  } catch (error) {
    res.status('400').send('bad request');
  }
};

const acceptAnswer = async function(req, res) {
  const { qOwnerId, answerId } = req.body;
  try {
    const isAccepted = await knexDataStore.updateAcceptAnswer(
      {
        isAccepted: 1
      },
      answerId,
      qOwnerId
    );
    return res.json({isAccepted});
  } catch (error) {
    res.status('400').send('bad request');
  }
};

const updateVote = async function (req, res) {
  const { responseId, table } = req.body;
  const [, action] = req.url.split('/');
  const delta = { upVote: 1, downVote: -1 };
  const types = { answers: 0, questions: 1 };
  const entries = {
    ownerId: req.session.id,
    responseId: +responseId,
    type: types[table],
    vote: delta[action]
  };
  try {
    res.json(await knexDataStore.updateVote(entries, table));
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
  serveEditQuestionPage,
  serveProfilePage,
  registerNewUser,
  postQuestion,
  updateQuestion,
  postAnswer,
  updateAnswer,
  postComment,
  updateComment,
  acceptAnswer,
  updateVote
};
