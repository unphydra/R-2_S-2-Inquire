require('dotenv').config({path: './.testEnv'});
const {env} = process;
const {DbClient, DatabaseUrlK} = env;

module.exports = {
  development: {
    client: DbClient,
    connection: {
      filename: DatabaseUrlK
    },
    useNullAsDefault: true
  },

  test: {
    client: DbClient,
    connection: {
      filename: DatabaseUrlK
    },
    useNullAsDefault: true
  },
};
