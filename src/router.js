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

const fetchAllIds = async function () {
  await dataStore.fetchIds('questions');
  await dataStore.fetchIds('answers');
  await dataStore.fetchIds('tags');
  await dataStore.fetchIds('comments');
};

fetchAllIds();

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
app.post('/newProfile', checkOptions('name', 'username'), registerNewUser);
app.get('/viewProfile', serveProfilePage);
app.get('/getProfile', serveProfileDetails);
app.get('/cancel', cancelRegistration);
app.post('/postQuestion', saveQuestion);
app.get('/askQuestion', servePostQuestionPage);

module.exports = { app };
