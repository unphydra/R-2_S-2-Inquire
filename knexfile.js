require('dotenv').config({path: './.env'});
const {env} = process;
const {DbClient, DatabaseUrlT, DatabaseUrl} = env;

module.exports = {
  development: {
    client: DbClient,
    connection: {
      filename: DatabaseUrl
    },
    useNullAsDefault: true
  },

  test: {
    client: DbClient,
    connection: {
      filename: DatabaseUrlT
    },
    useNullAsDefault: true
  },
};
