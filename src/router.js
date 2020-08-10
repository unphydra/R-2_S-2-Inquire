const express = require('express');
const morgan = require('morgan');
const cookeSession = require('cookie-session');
const app = express();

const { authRoute } = require('./userRouter');
const {
  isLoggedIn,
  serveLoginPage,
  reqLogin,
  fetchUserDetails,
  handleLogin,
  cancelRegistration,
  serveQuestions,
  serveHomepage,
  serveQuestionPage,
  serveProfilePage,
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
app.get('/question/:id', serveQuestionPage);
app.get('/viewProfile', serveProfilePage);

app.use(isLoggedIn, authRoute);

module.exports = { app };
