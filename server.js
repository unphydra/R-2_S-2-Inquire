const { log } = console;
const express = require('express');

const PORT = 8000;
const app = express();

app.use((req, res, next) => {
  log(`${req.method} ${req.url}`);
  next();
});

app.listen(PORT, () => log(`listening on port ${PORT}...`));
