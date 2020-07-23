const sqlite = require('sqlite3').verbose();
const { stdout } = require('process');
const DataStore = require('./library/dataStore');
const { app } = require('./src/router');
const { env } = process;
const { PORT, ClientID, ClientSecret, DatabaseUrl } = env;
const db = new sqlite.Database(DatabaseUrl);
const dataStore = new DataStore(db);

app.locals = { ClientID, ClientSecret, dataStore };

app.listen(PORT, () => stdout.write(`listening on port ${PORT}...\n`));
