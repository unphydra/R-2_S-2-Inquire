const { assert } = require('chai');
const DataStore = require('../library/dataStore');
const sqlite = require('sqlite3');
const { env } = process;
env.DatabaseUrl = './data/test.db';

describe('DataStore', function () {
  context('getAllQuestions', function () {
    it('should give all the details of the questions ', async function () {
      const db = new sqlite.Database(env.DatabaseUrl);
      const dataStore = new DataStore(db);
      const actual = await dataStore.getAllQuestions();
      const expected = [
        {
          answers: 1,
          id: 'q00001',
          tags: ['java', 'javaScript'],
          title: 'what is sqlite?',
          votes: -1,
        },
        {
          answers: 1,
          id: 'q00002',
          tags: ['node'],
          title: 'what is the most powerful thing in database?',
          votes: 0,
        },
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });
});
