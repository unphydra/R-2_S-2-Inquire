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
    (err) => err
  );
  if (!token) {
    return res.status('400').send('bad request');
  }
  const userInfo = await getUserInfo(token).catch((err) => err);
  if (!userInfo) {
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

const serveHomepage = (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/html/home.html`));
};

const serveQuestions = async (req, res) => {
  const { dataStore } = req.app.locals;
  const questions = await dataStore.getAllQuestions();
  const { id, avatar } = req.session;
  res.json({ userId: id, avatar, questions });
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

module.exports = {
  checkOptions,
  reqLogin,
  fetchUserDetails,
  handleLogin,
  serveHomepage,
  serveQuestions,
  serveQuestionPage,
  serveQuestionDetails,
  registerNewUser,
  serveProfilePage,
  serveProfileDetails,
  cancelRegistration
};
