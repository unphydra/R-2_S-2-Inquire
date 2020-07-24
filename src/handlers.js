const request = require('superagent');
const path = require('path');

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

const handleLogin = async function (req, res) {
  const { ClientID, ClientSecret, dataStore } = req.app.locals;
  const code = req.query.code;
  const token = await getToken(code, ClientSecret, ClientID);
  const userInfo = await getUserInfo(token);
  req.session = { id: userInfo.id, avatar: userInfo['avatar_url'] };
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
  res.write(JSON.stringify(questions));
  res.end();
};

const registerNewUser = async function (req, res) {
  const { dataStore } = req.app.locals;
  const { id, avatar } = req.session;
  await dataStore.addNewUser({ id, avatar, ...req.body });
  res.redirect('/');
};

module.exports = {
  reqLogin,
  handleLogin,
  serveHomepage,
  serveQuestions,
  registerNewUser,
};
