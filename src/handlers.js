const request = require('superagent');
const path = require('path');

const checkOptions = function (...args) {
  return function (req, res, next) {
    const hasOptions = args.every((arg) => req.body[arg]);
    if (!hasOptions) {
      return res.status('400').send('bad request');
    }
    next();
  };
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
  res.sendFile(path.resolve(`${__dirname}/../private/newProfile.html`));
};

const serveHomepage = async (req, res) => {
  const { dataStore } = req.app.locals;
  const questions = await dataStore.getAllQuestions();
  const { id } = req.session;
  const userInfo = await dataStore.findUser(id);
  res.render('home', {userInfo, userId: id, questions});
};

const serveQuestionPage = async (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../private/questionPage.html`));
};

const serveQuestionDetails = async (req, res) => {
  const { id } = req.params;
  const { dataStore } = req.app.locals;

  try {
    const questionDetails = await dataStore.getQuestionDetails(id);
    const { avatar } = req.session;
    return res.json({ userId: req.session.id, avatar, questionDetails });
  } catch (err) {
    return res.status('400').send('not found');
  }
};

const registerNewUser = async function (req, res) {
  const { dataStore } = req.app.locals;
  const { id, avatar } = req.session;
  await dataStore.addNewUser({ id, avatar, ...req.body });
  res.redirect('/');
};

const serveProfilePage = function (req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status('400').send('bad request');
  }
  res.sendFile(path.resolve(`${__dirname}/../private/profilePage.html`));
};

const serveProfileDetails = async function (req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status('400').send('bad request');
  }
  const { dataStore } = req.app.locals;
  const details = await dataStore.findUser(id);
  if (!details) {
    return res.status('404').send('not found');
  }
  res.json(details);
};

const cancelRegistration = function (req, res) {
  req.session = null;
  res.redirect('/');
};

const saveQuestion = async function(req, res){
  const {dataStore} = req.app.locals;
  const { id } = req.session;
  if(!id) {
    return res.status('401').send('unauthorized');
  }
  const { title, body } = req.body;
  const tags = req.body.tags.split(' ');
  const questionId = await dataStore.insertQuestion(id, title, body, tags);
  res.redirect(`/questionDetails/${questionId}`);
};

const servePostQuestionPage = async function(req, res) {
  const { dataStore } = req.app.locals;
  const { id } = req.session;
  const userInfo = await dataStore.findUser(id);
  res.render('postQuestion', { userId: id, userInfo });
};

module.exports = {
  checkOptions,
  reqLogin,
  fetchUserDetails,
  handleLogin,
  serveHomepage,
  serveQuestionPage,
  serveQuestionDetails,
  registerNewUser,
  serveProfilePage,
  serveProfileDetails,
  cancelRegistration,
  saveQuestion,
  servePostQuestionPage
};
