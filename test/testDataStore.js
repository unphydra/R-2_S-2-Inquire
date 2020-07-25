const { assert } = require('chai');
const DataStore = require('../library/dataStore');
const dataSeeding = require('./testDataSeeding');
const { dropTables, createTables, insertIntoTables } = dataSeeding;
const sqlite = require('sqlite3');
const { env } = process;
env.DatabaseUrl = './data/test.db';

describe('DataStore', function () {
  let dataStore;
  beforeEach(() => {
    const db = new sqlite.Database(env.DatabaseUrl);
    dataStore = new DataStore(db);
    dropTables(db);
    createTables(db);
    insertIntoTables(db);
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
      assert.deepStrictEqual(actual, []);
    });
  });

  context('FindUser', function() {
    it('should get user details when the user is present', async () => {
      const actual = await dataStore.findUser('58026024');
      assert.deepStrictEqual(
        actual, 
        {
          id: 'u58026024', 
          name: 'Rivu', 
          username: 'unphydra',
          company: 'thoughtworks',
          email: 'rivu123@gmail.com',
          avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
          bio: 'hi i\'m a developer'
        },
      );
    });
  });
});

describe('DataStore rejection', function () {
  let dataStore;
  beforeEach(() => {
    const db = new sqlite.Database(env.DatabaseUrl);
    dataStore = new DataStore(db);
    dropTables(db);
  });

  context('getAllQuestions', async() => {
    it('should give all the details of the questions ', async function () {
      const message = 'SQLITE_ERROR: no such table: questions';
      const actual = await dataStore.getAllQuestions()
        .catch(err => assert.deepStrictEqual(err.message, message));
      assert.isUndefined(actual);
    });
  });

  context('findUser', () => {
    it('should name something', async () => {
      const message = 'SQLITE_ERROR: no such table: users';
      const actual = await dataStore.findUser('123')
        .catch(err => assert.deepStrictEqual(err.message, message));
      assert.isUndefined(actual);
    });
  });
});
