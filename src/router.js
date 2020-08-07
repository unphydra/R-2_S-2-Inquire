const express = require('express');
const morgan = require('morgan');
const cookeSession = require('cookie-session');
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
  updateVote
} = require('./handlers');

const { env } = process;
const { ClientID, ClientSecret, CookieSecret } = env;

app.locals = { ClientID, ClientSecret, CookieSecret };

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
  [
    isLoggedIn, 
    checkOptions(['name', String], ['username', String]), 
    registerNewUser
  ]
);
app.post(
  '/postQuestion', 
  [
    isLoggedIn, 
    checkOptions(['title', String], ['body', String], ['tags', Array]), 
    postQuestion
  ]
);
app.post(
  '/updateQuestion/:questionId', 
  [
    isLoggedIn, 
    checkOptions(['title', String], ['body', String], ['tags', Array]), 
    updateQuestion
  ]
);
app.post(
  '/postAnswer/:questionId',
  [isLoggedIn, checkOptions(['answer', String]), postAnswer]
);
app.post(
  '/updateAnswer', 
  [
    isLoggedIn, 
    checkOptions(
      ['answer', String], ['answerId', Number], ['questionId', Number]
    ), 
    updateAnswer
  ]
);
app.post(
  '/postComment/:questionId/:type', 
  [
    isLoggedIn, 
    checkOptions(['comment', String], ['responseId', Number]), 
    postComment
  ]
);
app.post(
  '/updateComment/:questionId', 
  [
    isLoggedIn, 
    checkOptions(['comment', String], ['commentId', Number]), 
    updateComment
  ]
);
app.post(
  '/acceptAnswer', 
  [
    isLoggedIn, 
    checkOptions(['qOwnerId', Number], ['answerId', Number]),
    acceptAnswer
  ]
);
app.post(
  ['/upVote/:table/:resId', '/downVote/:table/:resId'],
  [isLoggedIn, updateVote]
);

module.exports = { app };
