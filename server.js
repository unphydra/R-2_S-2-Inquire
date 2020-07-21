const express = require('express');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const sqlite3 = require('sqlite3');

const PORT = 8000;
const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.listen(PORT, () => console.log(`listening on port ${PORT}...`));
