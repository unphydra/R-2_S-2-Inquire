const express = require('express');
const morgan = require('morgan');
const { static } = require('express');
const app = express();
const { serveHomepage } = require('./handlers');

app.use(morgan('tiny'));
app.use(static('public', { index: '/html/home.html' }));

app.get('/home', serveHomepage);

module.exports = { app };
