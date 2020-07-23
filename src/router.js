const express = require('express');
const morgan = require('morgan');
const { static } = require('express');
const app = express();
const { 
  reqLogin,
  handleLogin,
  serveHomepage,
  serveQuestions 
} = require('./handlers');

app.use(morgan('tiny'));
app.use(static('public', { index: '/html/home.html' }));

app.get('/login', reqLogin);
app.get('/user/auth', handleLogin);
app.get('/home', serveHomepage);
app.get('/questions', serveQuestions);

module.exports = { app };
