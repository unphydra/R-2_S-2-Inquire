const express = require('express');
const morgan = require('morgan');
const app = express();
const { reqLogin, handleLogin} = require('./handlers');

app.use(morgan('common'));
app.get('/login', reqLogin);
app.get('/user/auth', handleLogin);

module.exports = { app };
