const { assert } = require('chai');
const sinon = require('sinon');
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
          anyAnswerAccepted: 0,
        },
        {
          answers: 1,
          id: 'q00002',
          tags: ['node'],
          title: 'what is the most powerful thing in database?',
          votes: 0,
          anyAnswerAccepted: 0,
        },
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('AddNewUser', function () {
    it('should add a new user to database', async function () {
      const actual = await dataStore.addNewUser({
        id: '123',
        name: 'test',
        username: 'test',
        email: 'test',
        bio: 'test',
      });
      assert.deepStrictEqual(actual, []);
    });

    it('should not add a new user when the user already present', async () => {
      const message = 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.id';
      const actual = await dataStore
        .addNewUser({
          id: '123',
          name: 'test',
          username: 'test',
          email: 'test',
          bio: 'test',
        })
        .catch((err) => {
          assert.deepStrictEqual(err.message, message);
        });
      assert.deepStrictEqual(actual, []);
    });
  });

  context('FindUser', function () {
    it('should get user details when the user is present', async () => {
      const actual = await dataStore.findUser('58026024');
      assert.deepStrictEqual(actual, {
        id: 'u58026024',
        name: 'Rivu',
        username: 'unphydra',
        company: 'thoughtworks',
        email: 'rivu123@gmail.com',
        avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
        bio: 'hi i\'m a developer',
      });
    });
  });

  context('GetQuestionDetails', () => {
    it('should name something', async () => {
      sinon.useFakeTimers();
      const actual = await dataStore.getQuestionDetails('q00001');
      const expected = {
        id: 'q00001',
        title: 'what is sqlite?',
        body: 'i want to know about sqlite',
        votes: -1,
        receivedAt: '2020-07-25 15:14:36',
        modifiedAt: '2020-07-25 15:14:36',
        anyAnswerAccepted: 0,
        ownerId: 'u58026024',
        tags: [{ title: 'java' }, { title: 'javaScript' }],
        comments: [
          {
            id: 'c00001',
            responseId: 'q00001',
            ownerId: 'u58027206',
            comment: 'what you want to know',
            receivedAt: '2020-07-25 15:14:36',
            username: 'satheesh-chandran'
          },
        ],
        answers: [
          {
            id: 'a00001',
            questionId: 'q00001',
            ownerId: 'u58027206',
            answer: 'search it on google',
            receivedAt: '2020-07-25 15:14:36',
            modifiedAt: '2020-07-25 15:14:36',
            isAccepted: 0,
            votes: 0,
            comments: [
              {
                id: 'c00002',
                responseId: 'a00001',
                ownerId: 'u58026024',
                comment: 'yes you are right',
                receivedAt: '2020-07-25 15:14:36',
                username: 'unphydra'
              },
            ],
          },
        ],
      };
      assert.deepStrictEqual(actual, expected);
    });

    it('should give error if the question id is invalid', async function () {
      const actual = await dataStore.getQuestionDetails('abcd').catch((err) => {
        const message = 'TypeError: Cannot set property \'tags\' of undefined';
        assert.deepStrictEqual(err.message, message);
      });
      assert.isUndefined(actual);
    });
  });

  context('fetchIds', () => {
    it('should give the last id after fetching', async function () {
      const actual = await dataStore.fetchIds('questions');
      assert.equal(actual, 2);
    });
  });

  context('insertAnswer', () => {
    it('should give the answer id after insertion', async function () {
      const actual = await dataStore.insertAnswer('q00001', 'u123', 'testing');
      assert.deepStrictEqual(actual, 'a00003');
    });
  });

  context('saveComment', function () {
    it('should give the latest comment id after insertion', async function () {
      const actual = await dataStore.saveComment('u58026024', 'q00002', 'test');
      assert.deepStrictEqual(actual, 'c00005');
    });
  });

  context('getRow', function () {
    it('should give specific row for the given id', async function () {
      const expected = {
        id: 'a00002',
        questionId: 'q00002',
        ownerId: 'u58026024',
        answer: 'database itself',
        receivedAt: '2020-07-25 15:14:36',
        modifiedAt: '2020-07-25 15:14:36',
        isAccepted: 0,
        votes: 1
      };
      const actual = await dataStore.getRow('answers', 'a00002');
      assert.deepStrictEqual(actual, expected);
    });

    it('should give undefined for wrong id', async function () {
      const actual = await dataStore.getRow('answers', 'a00006');
      assert.isUndefined(actual);
    });
  });

  context('acceptAnswer', () => {
    it('should give isAccepted 1 questionId and answerId', async function () {
      const actual = await dataStore.acceptAnswer('q00001', 'a00001');
      assert.deepStrictEqual(actual, {isAccepted: 1});
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

  context('getAllQuestions', async () => {
    it('should give all the details of the questions ', async function () {
      const message = 'SQLITE_ERROR: no such table: questions';
      const actual = await dataStore
        .getAllQuestions()
        .catch((err) => assert.deepStrictEqual(err.message, message));
      assert.isUndefined(actual);
    });
  });

  context('findUser', () => {
    it('should name something', async () => {
      const message = 'SQLITE_ERROR: no such table: users';
      const actual = await dataStore
        .findUser('123')
        .catch((err) => assert.deepStrictEqual(err.message, message));
      assert.isUndefined(actual);
    });
  });

  context('getQuery', () => {
    it('should name something', async () => {
      const query = 'select * from something';
      const message = 'SQLITE_ERROR: no such table: something';
      const actual = await dataStore
        .getQuery(query)
        .catch((err) => assert.deepStrictEqual(err.message, message));
      assert.isUndefined(actual);
    });
  });
});

describe('New Insertion in Database', function () {
  let dataStore;
  let db;
  beforeEach(() => {
    db = new sqlite.Database(env.DatabaseUrl);
    dataStore = new DataStore(db);
    dropTables(db);
    createTables(db);
  });

  context('insertQuestion', async () => {
    it('should give the new question id after insertion', async function () {
      const tags = ['javaScript', 'node'];
      const actual = await dataStore
        .insertQuestion('u123', 'title', 'body', tags);
      assert.deepStrictEqual(actual, 'q00001');
    });
    
  });

  context('fetchIds', async () => {
    it('should return zero if no data is present on the table', async () => {
      const actual = await dataStore.fetchIds('questions');
      assert.equal(actual, 0);
    });
  });

  context('getTagId', async () => {
    it('should give the new tag-id by inserting if not exists', async () => {
      const actual = await dataStore
        .getTagId('java');
      assert.deepStrictEqual(actual, 't00001');
    });

    it('should give the tagIds of tags which are present', async () => {
      insertIntoTables(db);
      const actual = await dataStore
        .getTagId('java');
      assert.deepStrictEqual(actual, 't00001');
    });
  });

  context('insertTags', async () => {
    it('should give the new tagIds after insertion', async () => {
      const actual = await dataStore
        .insertTags('q00001', ['java', 'node']);
      assert.deepStrictEqual(actual, ['t00001', 't00002']);
    });
  });

  context('getVoteCount', async () => {
    it('should give votes in questions', async () => {
      await insertIntoTables(db);
      const actual = await dataStore.getVoteCount('questions', 'q00001');
      assert.deepStrictEqual(actual, {votes: -1});
    });

    it('should give empty when no table present', async () => {
      const message = 'SQLITE_ERROR: no such table: test';
      await dataStore.getVoteCount('test', 'test').catch(err => {
        assert.deepStrictEqual(err.message, message);
      });
    });
  });

  context('updateResponseVote', async () => {
    it('should update votes in questions', async () => {
      await insertIntoTables(db);
      await dataStore.updateResponseVote('questions', 'q00001', 3);
      const actual = await dataStore.getVoteCount('questions', 'q00001');
      assert.deepStrictEqual(actual, {votes: 2});
    });
  });

  context('getVoteLog', async () => {
    it('should give details of vote log', async () => {
      await insertIntoTables(db);
      const actual = await dataStore.getVoteLog('58027206', 'q00001');
      assert.deepStrictEqual(actual, {
        'ownerId': 'u58027206',
        'responseId': 'q00001',
        'vote': 0
      });
    });

    it('should not give details when log is not present', async () => {
      const actual = await dataStore.getVoteLog('58027206', 'q00001');
      assert.isUndefined(actual);
    });
  });

  context('deleteVoteLog', async () => {
    it('should delete a log from vote log', async () => {
      await insertIntoTables(db);
      await dataStore.deleteVoteLog('58027206', 'q00001');
      const actual = await dataStore.getVoteLog('58027206', 'q00001');
      assert.isUndefined(actual);
    });
  });

  context('insertToVoteLog', async () => {
    it('should insert new log in vote log', async () => {
      await dataStore.insertToVoteLog('58027206', 'q00001', 1);
      const actual = await dataStore.getVoteLog('58027206', 'q00001');
      assert.deepStrictEqual(actual, {
        'ownerId': 'u58027206',
        'responseId': 'q00001',
        'vote': 1
      });
    });
  });
});

