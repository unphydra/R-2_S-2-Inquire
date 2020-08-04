const { assert } = require('chai');
const {env} = process;
env.DatabaseUrl = './data/knex.db';
env.DbClient = 'sqlite3';
const knexDataStore = require('../library/knexDataStore');

const {
  dropTableTransaction,
  createTableTransaction,
  insertDataTransaction
} = require('./testKnexDataSeeding');

describe('knexDataStore', () => {
  const knex = knexDataStore.knex;
  beforeEach(async() => {
    await dropTableTransaction(knex);
    await createTableTransaction(knex);
    await insertDataTransaction(knex);
  });
  process.on('end', () => knex.destroy());

  context('getAllQuestions', () => {
    it('should get all details', async() => {
      const actual = await knexDataStore.getAllQuestions();
      const expected = [
        {
          id: 1,
          ownerId: 58026024,
          title: 'what is sqlite?',
          body: 'i want to know about sqlite',
          receivedAt: '2020-08-03 15:31:15',
          modifiedAt: '2020-08-03 15:31:15',
          ownerName: 'unphydra',
          avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
          ansCount: 1,
          vote: 2,
          isAnsAccepted: null,
          tags: [{ title: 'java' }, { title: 'javaScript' }]
        },
        {
          id: 2,
          ownerId: 58027206,
          title: 'what is the most powerful thing in database?',
          body: 'i want to know it',
          receivedAt: '2020-08-03 15:31:15',
          modifiedAt: '2020-08-03 15:31:15',
          ownerName: 'satheesh-chandran',
          avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
          ansCount: 1,
          vote: -1,
          isAnsAccepted: null,
          tags: [{ title: 'node' }]
        }
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });
});
