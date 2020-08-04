const { assert } = require('chai');
const path = require('path');
const dotEnvPath = path.resolve('./.testEnv');
require('dotenv').config({ path: dotEnvPath});
const knex = require('../library/knex');
const knexDataStore = require('../library/knexDataStore');

const {
  dropTableTransaction,
  createTableTransaction,
  insertDataTransaction
} = require('./testKnexDataSeeding');

describe('knexDataStore', () => {
  beforeEach(async() => {
    await dropTableTransaction(knex);
    await createTableTransaction(knex);
    await insertDataTransaction(knex);
  });

  process.on('exit', () => knex.destroy());

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
          username: 'unphydra',
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
          username: 'satheesh-chandran',
          avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
          ansCount: 2,
          vote: -1,
          isAnsAccepted: 1,
          tags: [{ title: 'node' }]
        }
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('getUser', () => {
    it('should give user data', async() => {
      const actual = await knexDataStore.getUser(58026024);
      const expected = [
        {
          id: 58026024,
          name: 'Rivu',
          username: 'unphydra',
          company: 'thoughtworks',
          email: 'rivu123@gmail.com',
          avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
          bio: 'hi i\'m a developer'
        }
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('addNewUser', () => {
    it('should add a new user', async() => {
      const userData = {
        id: 1, 
        name: 'test', 
        username: 'test', 
        avatar: 'test', 
        company: 'test', 
        email: 'test', 
        bio: 'test'
      };
      const actual = await knexDataStore.addNewUser(userData);
      const expected = [1];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('getYourQuestions', () => {
    it('should get all the questions of given user', async() => {
      const actual = await knexDataStore.getYourQuestions(58026024);
      const expected = [
        {
          id: 1,
          ownerId: 58026024,
          title: 'what is sqlite?',
          body: 'i want to know about sqlite',
          receivedAt: '2020-08-03 15:31:15',
          modifiedAt: '2020-08-03 15:31:15',
          username: 'unphydra',
          avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
          ansCount: 1,
          vote: 2,
          isAnsAccepted: null,
          tags: [{title: 'java'}, {title: 'javaScript'}]
        }
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('getQuestionDetails', () => {
    it('should give the question details of given id', async() => {
      const actual = await knexDataStore.getQuestionDetails(2);
      const expected = {
        id: 2,
        ownerId: 58027206,
        title: 'what is the most powerful thing in database?',
        body: 'i want to know it',
        receivedAt: '2020-08-03 15:31:15',
        modifiedAt: '2020-08-03 15:31:15',
        username: 'satheesh-chandran',
        avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
        ansCount: 2,
        vote: -1,
        tag: 'node',
        isAnsAccepted: 1,
        comments: [
          {
            id: 3,
            ownerId: 58026024,
            responseId: 2,
            comment: 'It is wrong',
            type: 1,
            receivedAt: '2020-08-03 15:31:15',
            modifiedAt: '2020-08-03 15:31:15',
            username: 'unphydra'
          }
        ],
        answers: [
          {
            id: 2,
            questionId: 2,
            ownerId: 58026024,
            answer: 'database itself',
            isAccepted: null,
            receivedAt: '2020-08-03 15:31:15',
            modifiedAt: '2020-08-03 15:31:15',
            username: 'unphydra',
            avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
            votes: -1,
            comments: [
              {
                id: 4,
                ownerId: 58027206,
                responseId: 2,
                comment: 'you are wrong',
                type: 0,
                receivedAt: '2020-08-03 15:31:15',
                modifiedAt: '2020-08-03 15:31:15',
                username: 'satheesh-chandran'
              },
              {
                id: 5,
                ownerId: 58027206,
                responseId: 2,
                comment: 'you are wrong 2nd',
                type: 0,
                receivedAt: '2020-08-03 15:31:15',
                modifiedAt: '2020-08-03 15:31:15',
                username: 'satheesh-chandran'
              }
            ]
          },
          {
            id: 3,
            questionId: 2,
            ownerId: 58026024,
            answer: 'database itself 2nd',
            isAccepted: 1,
            receivedAt: '2020-08-03 15:31:15',
            modifiedAt: '2020-08-03 15:31:15',
            username: 'unphydra',
            avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
            votes: null,
            comments: []
          }
        ]
      };
      assert.deepStrictEqual(actual, expected);
    });
  });
});
