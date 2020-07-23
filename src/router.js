const express = require('express');
const morgan = require('morgan');
const { static } = require('express');
const app = express();
const { serveHomepage, reqLogin, handleLogin } = require('./handlers');

app.use(morgan('tiny'));
app.use(static('public', { index: '/html/home.html' }));

app.get('/home', serveHomepage);
app.get('/login', reqLogin);
app.get('/user/auth', handleLogin);

module.exports = { app };
