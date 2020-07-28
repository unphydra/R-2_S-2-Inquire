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
  serveQuestionPage,
  serveQuestionDetails,
  registerNewUser,
  serveProfilePage,
  serveProfileDetails,
  cancelRegistration,
  saveQuestion,
  servePostQuestionPage
} = require('./handlers');

const { env } = process;
const { ClientID, ClientSecret, DatabaseUrl, CookieSecret } = env;
const db = new sqlite.Database(DatabaseUrl);
const dataStore = new DataStore(db);
dataStore.fetchIds('questions');
dataStore.fetchIds('answers');
dataStore.fetchIds('tags');
dataStore.fetchIds('comments');

app.locals = { ClientID, ClientSecret, dataStore, CookieSecret };

app.use(morgan('tiny'));
app.use(cookeSession({ secret: app.locals.CookieSecret }));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public', { index: '/html/home.html' }));

app.get('/login', reqLogin);
app.get('/user/auth', fetchUserDetails, handleLogin);
app.get(['/', '/home'], serveHomepage);
app.get('/question/:id', serveQuestionPage);
app.get('/questionDetails/:id', serveQuestionDetails);
app.post('/newProfile', checkOptions('name', 'username'), registerNewUser);
app.get('/viewProfile', serveProfilePage);
app.get('/getProfile', serveProfileDetails);
app.get('/cancel', cancelRegistration);
app.post('/postQuestion', saveQuestion);
app.get('/askQuestion', servePostQuestionPage);

module.exports = { app };
