const express = require('express');
const morgan = require('morgan');
const cookeSession = require('cookie-session');
const sqlite = require('sqlite3').verbose();
const DataStore = require('../library/dataStore');
const app = express();

const {
  reqLogin,
  handleLogin,
  serveHomepage,
  serveQuestions,
  registerNewUser,
} = require('./handlers');

const { env } = process;
const { ClientID, ClientSecret, DatabaseUrl, CookieSecret } = env;
const db = new sqlite.Database(DatabaseUrl);
const dataStore = new DataStore(db);

app.locals = { ClientID, ClientSecret, dataStore, CookieSecret };

app.use(morgan('tiny'));
app.use(cookeSession({ secret: app.locals.CookieSecret }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public', { index: '/html/home.html' }));

app.get('/login', reqLogin);
app.get('/user/auth', handleLogin);
app.get('/home', serveHomepage);
app.get('/questions', serveQuestions);
app.post('/newProfile', registerNewUser);

module.exports = { app };
