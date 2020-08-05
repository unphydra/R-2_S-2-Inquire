const express = require('express');
const morgan = require('morgan');
const cookeSession = require('cookie-session');
const sqlite = require('sqlite3').verbose();
const DataStore = require('../library/dataStore');
const app = express();

const {
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
  getUpdateVoteDetails,
  updateVote
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

app.get('/loginPage', serveLoginPage);
app.get('/user/auth', fetchUserDetails, handleLogin);
app.get('/login', reqLogin);
app.get('/cancel', cancelRegistration);

app.get(['/', '/home'], serveHomepage, serveQuestions);
app.get('/yourQuestions', isLoggedIn, serveYourQuestionsPage, serveQuestions);
app.get('/yourAnswers', isLoggedIn, serveYourAnswersPage, serveQuestions);
app.get('/question/:id', serveQuestionPage);
app.get('/askQuestion', isLoggedIn, servePostQuestionPage);
app.get('/editQuestion/:questionId', isLoggedIn, serveEditQuestionPage);
app.get('/viewProfile', serveProfilePage);

app.post(
  '/newProfile', 
  [isLoggedIn, checkOptions('name', 'username'), registerNewUser]
);
app.post(
  '/postQuestion', 
  [isLoggedIn, checkOptions('title', 'body', 'tags'), postQuestion]
);
app.post(
  '/updateQuestion/:questionId', 
  [isLoggedIn, checkOptions('title', 'body', 'tags'), updateQuestion]
);
app.post(
  '/postAnswer/:questionId',
  [isLoggedIn, checkOptions('answer'), postAnswer]
);
app.post(
  '/updateAnswer', 
  [isLoggedIn, checkOptions('answer', 'answerId'), updateAnswer]
);
app.post(
  '/postComment/:questionId/:resId', 
  [isLoggedIn, checkOptions('comment'), postComment]
);
app.post(
  '/updateComment', 
  [isLoggedIn, checkOptions('comment', 'commentId'), updateComment]
);
app.post('/acceptAnswer/:questionId/:answerId', isLoggedIn, acceptAnswer);
app.post(
  ['/upVote/:type/:resId', '/downVote/:type/:resId'],
  [isLoggedIn, getUpdateVoteDetails, updateVote]
);

module.exports = { app };
