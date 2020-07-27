const express = require('express');
const morgan = require('morgan');
const cookeSession = require('cookie-session');
const sqlite = require('sqlite3').verbose();
const DataStore = require('../library/dataStore');
const app = express();

const {
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
} = require('./handlers');

const { env } = process;
const { ClientID, ClientSecret, DatabaseUrl, CookieSecret } = env;
const db = new sqlite.Database(DatabaseUrl);
const dataStore = new DataStore(db);

app.locals = { ClientID, ClientSecret, dataStore, CookieSecret };

app.use(morgan('tiny'));
app.use(cookeSession({ secret: app.locals.CookieSecret }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public', { index: '/html/home.html' }));

app.get('/login', reqLogin);
app.get('/user/auth', fetchUserDetails, handleLogin);
app.get('/home', serveHomepage);
app.get('/questions', serveQuestions);
app.get('/question/:id', serveQuestionPage);
app.get('/questionDetails/:id', serveQuestionDetails);
app.post('/newProfile', checkOptions('name', 'username'), registerNewUser);
app.get('/viewProfile', serveProfilePage);
app.get('/getProfile', serveProfileDetails);
app.get('/cancel', cancelRegistration);

module.exports = { app };
