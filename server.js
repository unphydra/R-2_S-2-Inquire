const { stdout, env } = require('process');
const { app } = require('./src/router');
const { PORT } = env;

app.listen(PORT, () => stdout.write(`listening on port ${PORT}...\n`));
