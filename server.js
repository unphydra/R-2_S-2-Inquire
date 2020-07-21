const { stdout } = require('process');
const { app } = require('./src/app');
const PORT = 8000;

app.listen(PORT, () => stdout.write(`listening on port ${PORT}...\n`));
