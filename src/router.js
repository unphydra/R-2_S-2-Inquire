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
  cancelRegistration,
  saveQuestion,
  servePostQuestionPage,
  serveLoginPage,
  postAnswer,
  postComment,
  isLoggedIn,
  updateVote,
  acceptAnswer,
  getUpdateVoteDetails,
  serveYourQuestionsPage
} = require('./handlers');

const { env } = process;
const { ClientID, ClientSecret, DatabaseUrl, CookieSecret } = env;
const db = new sqlite.Database(DatabaseUrl);
const dataStore = new DataStore(db);

app.locals = { ClientID, ClientSecret, dataStore, CookieSecret };

app.use(morgan('tiny'));
app.use(cookeSession({ secret: app.locals.CookieSecret }));
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public', { index: '/html/home.html' }));
app.set('sessionMiddleware', cookeSession({secret: CookieSecret }));
app.use((...args) => app.get('sessionMiddleware')(...args));

app.get('/login', reqLogin);
app.get('/loginPage', serveLoginPage);
app.get('/user/auth', fetchUserDetails, handleLogin);
app.get(['/', '/home'], serveHomepage);
app.get('/yourQuestions', isLoggedIn, serveYourQuestionsPage, serveHomepage);
app.get('/question/:id', serveQuestionPage);
app.post('/newProfile', checkOptions('name', 'username'), registerNewUser);
app.get('/viewProfile', serveProfilePage);
app.get('/cancel', cancelRegistration);
app.post('/postQuestion', isLoggedIn, saveQuestion);
app.get('/askQuestion', servePostQuestionPage);
app.post('/postAnswer/:questionId', isLoggedIn, postAnswer);
app.post('/postComment/:questionId/:resId', isLoggedIn, postComment);
app.post('/acceptAnswer/:questionId/:answerId', isLoggedIn, acceptAnswer);
app.get(
  ['/upVote/:type/:resId', '/downVote/:type/:resId'],
  [isLoggedIn, getUpdateVoteDetails, updateVote]
);

module.exports = { app };
