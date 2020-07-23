const request = require('superagent');
const path = require('path');
const { env } = process;
const { ClientID, ClientSecret } = env;

const reqLogin = function (req, res) {
  const redirectUri = 'http://localhost:8000/user/auth';
  const route = 'https://github.com/login/oauth/authorize';
  const url = `${route}?client_id=${ClientID}&redirect_uri=${redirectUri}`;
  res.redirect(url);
};

const getToken = function (code) {
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
  const code = req.query.code;
  const token = await getToken(code);
  const userInfo = await getUserInfo(token);
  res.send(userInfo);
};

const serveHomepage = (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/html/home.html`));
};

const serveQuestions = (req, res) => {
  const questions = [
    { title: 'What is express ?', votes: 5, answers: 7, tags: ['express'] },
    {
      title: 'nodejs v/s angularjs ?',
      votes: 5,
      answers: 7,
      tags: ['js', 'node'],
    },
  ];
  res.write(JSON.stringify(questions));
  res.end();
};

module.exports = { reqLogin, handleLogin, serveHomepage, serveQuestions };
