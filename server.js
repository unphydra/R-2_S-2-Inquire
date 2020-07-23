const { stdout } = require('process');
const { app } = require('./src/app');
const {env} = process;
const PORT = env.PORT;

app.listen(PORT, () => stdout.write(`listening on port ${PORT}...\n`));
