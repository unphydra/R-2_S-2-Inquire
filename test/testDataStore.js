const { assert } = require('chai');
const DataStore = require('../library/dataStore');
const sqlite = require('sqlite3');
const { env } = process;
env.DatabaseUrl = './data/test.db';

describe('DataStore', function () {
  let dataStore;
  beforeEach(() => {
    const db = new sqlite.Database(env.DatabaseUrl);
    dataStore = new DataStore(db);
  });

  context('getAllQuestions', function () {
    it('should give all the details of the questions ', async function () {
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
  
  context('AddNewUser', function(){
    it('should add a new user to database', async function(){
      const actual = await dataStore.addNewUser(
        {id: '123', name: 'test', username: 'test', email: 'test', bio: 'test'}
      );
      assert.deepStrictEqual(actual, []);
    });

    it('should not add a new user when the user already present', async() => {
      const message = 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.id';
      const actual = await dataStore.addNewUser(
        {id: '123', name: 'test', username: 'test', email: 'test', bio: 'test'}
      ).catch(err => {
        assert.deepStrictEqual(err.message, message);
      });
      assert.deepStrictEqual(actual, undefined);
    });
  });

  context('FindUser', function() {
    it('should get user details when the user is in present', async () => {
      const actual = await dataStore.findUser('123');
      assert.deepStrictEqual(
        actual, 
        {
          id: 'u123',
          name: 'test', 
          username: 'test', 
          email: 'test', 
          bio: 'test', 
          company: 'undefined', 
          avatar: 'undefined'
        }
      );
    });

    it('should throw error when the db is close', async() => {
      const message = 'SQLITE_MISUSE: Database handle is closed';
      dataStore.db.close();
      const actual = await dataStore.findUser('123')
        .catch(err => assert.deepStrictEqual(err.message, message));
      assert.deepStrictEqual(actual, undefined);
    });
  });

  context('GetAnswerAndVoteCount', function(){
    it('should give answer and vote count for all questions', async() => {
      const actual = await dataStore.getAnswerAndVoteCount();
      const expected = [
        { id: 'q00001', title: 'what is sqlite?', votes: -1, answers: 1 },
        {
          id: 'q00002',
          title: 'what is the most powerful thing in database?',
          votes: 0,
          answers: 1
        }
      ];
      assert.deepStrictEqual(actual, expected);
    });

    it('should throw error when the db is close', async() => {
      const message = 'SQLITE_MISUSE: Database handle is closed';
      dataStore.db.close();
      const actual = await dataStore.getAnswerAndVoteCount()
        .catch(err => assert.deepStrictEqual(err.message, message));
      assert.deepStrictEqual(actual, undefined);
    });
  });

  context('GetTags', function(){
    it('should give answer and vote count for all questions', async() => {
      const actual = await dataStore.getTags();
      const expected = [
        { questionId: 'q00001', tags: 'java,javaScript' },
        { questionId: 'q00002', tags: 'node' }
      ];
      assert.deepStrictEqual(actual, expected);
    });

    it('should throw error when the db is close', async() => {
      const message = 'SQLITE_MISUSE: Database handle is closed';
      dataStore.db.close();
      const actual = await dataStore.getTags()
        .catch(err => assert.deepStrictEqual(err.message, message));
      assert.deepStrictEqual(actual, undefined);
    });
  });
});
