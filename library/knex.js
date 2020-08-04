const {env} = process;
const {NODE_ENV} = env;
const config = require('../knexfile')[NODE_ENV];
module.exports = require('knex')(config);
