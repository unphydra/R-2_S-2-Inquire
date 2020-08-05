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
          id: 2,
          ownerId: 58027206,
          title: 'what is the most powerful thing in database?',
          body: 'i want to know it',
          receivedAt: '2020-08-03 15:35:15',
          modifiedAt: '2020-08-03 15:35:15',
          username: 'satheesh-chandran',
          avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
          ansCount: 2,
          vote: -1,
          isAnsAccepted: [{isAnsAccepted: 1}],
          tags: [{ title: 'node' }, { title: 'node-net' }]
        },
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
          isAnsAccepted: [],
          tags: [{ title: 'java' }, { title: 'javaScript' }]
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
          isAnsAccepted: [],
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
        receivedAt: '2020-08-03 15:35:15',
        modifiedAt: '2020-08-03 15:35:15',
        username: 'satheesh-chandran',
        avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
        ansCount: 2,
        vote: -1,
        tags: [{ title: 'node' }, { title: 'node-net' }],
        isAnsAccepted: [{isAnsAccepted: 1}],
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
            id: 3,
            questionId: 2,
            ownerId: 58026024,
            answer: 'database itself 2nd',
            isAccepted: 1,
            receivedAt: '2020-08-03 15:35:15',
            modifiedAt: '2020-08-03 15:35:15',
            username: 'unphydra',
            avatar: 'https://avatars3.githubusercontent.com/u/58026024?v=4',
            votes: null,
            comments: []
          },
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
                receivedAt: '2020-08-03 15:35:15',
                modifiedAt: '2020-08-03 15:35:15',
                username: 'satheesh-chandran'
              }
            ]
          }
        ]
      };
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('allQuestionYouAnswered', () => {
    it('should name something', async() => {
      const actual = await knexDataStore.allQuestionsYourAnswered(58026024);
      const expected = [
        {
          id: 2,
          ownerId: 58027206,
          title: 'what is the most powerful thing in database?',
          body: 'i want to know it',
          receivedAt: '2020-08-03 15:35:15',
          modifiedAt: '2020-08-03 15:35:15',
          username: 'satheesh-chandran',
          avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
          ansCount: 2,
          vote: -1,
          isAnsAccepted: [{'isAnsAccepted': 1}],
          tags: [{title: 'node'}, {title: 'node-net'}]
        }
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('getAllTags', () => {
    it('should give all the tags', async() => {
      const actual = await knexDataStore.getAllTags();
      const expected = [
        { id: 1, title: 'java' },
        { id: 2, title: 'javaScript' },
        { id: 3, title: 'node' },
        { id: 4, title: 'node-net' }
      ];
      assert.deepStrictEqual(actual, expected);
    });
  });

  context('insertNewQuestion', () => {
    it('should add a new question', async() => {
      const actual1 = await knexDataStore.insertNewQuestion({
        ownerId: 58027206,
        title: 'test',
        body: 'test',
        receivedAt: '2020-08-05 06:15:32',
        modifiedAt: '2020-08-05 06:15:32'
      },
      ['tag1', 'tag2']
      );
      const actual2 = await knexDataStore.getAllQuestions();
      const expected = [
        {
          id: 3,
          ownerId: 58027206,
          title: 'test',
          body: 'test',
          receivedAt: '2020-08-05 06:15:32',
          modifiedAt: '2020-08-05 06:15:32',
          username: 'satheesh-chandran',
          avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
          ansCount: null,
          vote: null,
          isAnsAccepted: [],
          tags: [{ title: 'tag1' }, { title: 'tag2' }]
        },
        {
          id: 2,
          ownerId: 58027206,
          title: 'what is the most powerful thing in database?',
          body: 'i want to know it',
          receivedAt: '2020-08-03 15:35:15',
          modifiedAt: '2020-08-03 15:35:15',
          username: 'satheesh-chandran',
          avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
          ansCount: 2,
          vote: -1,
          isAnsAccepted: [{ isAnsAccepted: 1 }],
          tags: [{ title: 'node' }, { title: 'node-net' }]
        },
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
          isAnsAccepted: [],
          tags: [{ title: 'java' }, { title: 'javaScript' }]
        }
      ];
      assert.deepStrictEqual(actual1, [6]);
      assert.deepStrictEqual(actual2, expected);
    });
  });

  context('updateQuestion', () => {
    it('should update the existing question', async() => {
      const actual = await knexDataStore.updateQuestion({
        id: 2,
        ownerId: 58027206,
        title: 'test',
        body: 'test',
      },
      ['tag1', 'tag2']
      );
      const expected = [4];
      assert.deepStrictEqual(actual, expected);
    });

    it('should not update if the question id invalid', async() => {
      await knexDataStore.updateQuestion({
        id: -1,
        ownerId: 58027206,
        title: 'test',
        body: 'test',
      }
      ).catch(err => assert.match(err, /Error/));
    });

    it('should not update if the question owner id mismatch', async() => {
      await knexDataStore.updateQuestion({
        id: 1,
        ownerId: 58027206,
        title: 'test',
        body: 'test',
      }
      ).catch(err => assert.match(err, /Error/));
    });
  });

  context('insertNewAnswer', () => {
    it('should insert a new answer', async() => {
      const actual = await knexDataStore.insertNewAnswer({
        ownerId: 58026024,
        questionId: 1,
        answer: 'test'
      });
      const expected = [4];
      assert.deepStrictEqual(actual, expected);
      
    });

    it('should not insert a new answer if question id invalid', async() => {
      await knexDataStore.insertNewAnswer({
        ownerId: 58026024,
        answer: 'test',
        questionId: -1
      }).catch(err => assert.match(err, /Error/));
    });
  });

  context('updateAnswer', () => {
    it('should update the existing answer', async() => {
      const actual = await knexDataStore.updateAnswer({
        id: 2,
        ownerId: 58026024,
        answer: 'test updated',
      }
      );
      const expected = 3;
      assert.deepStrictEqual(actual, expected);
    });

    it('should not update if the answer id invalid', async() => {
      await knexDataStore.updateAnswer({
        id: -1,
        ownerId: 58026024,
        answer: 'test',
      }
      ).catch(err => assert.match(err, /Error/));
    });

    it('should not update if the answer owner id mismatch', async() => {
      await knexDataStore.updateAnswer({
        id: 1,
        ownerId: 58026024,
        answer: 'test',
      }
      ).catch(err => assert.match(err, /Error/));
    });
  });

  context('insertNewComment', () => {
    it('should insert a new comment', async() => {
      const actual = await knexDataStore.insertNewComment({
        ownerId: 58026024,
        responseId: 1,
        comment: 'test',
        type: 1
      },
      'questions'
      );
      const expected = [6];
      assert.deepStrictEqual(actual, expected);
      
    });

    it('should not insert a new comment if response id invalid', async() => {
      await knexDataStore.insertNewComment({
        ownerId: 58026024,
        comment: 'test',
        responseId: -1
      },
      'questions'
      ).catch(err => assert.match(err, /Error/));
    });
  });

  context('updateComment', () => {
    it('should update the existing comment', async() => {
      const actual = await knexDataStore.updateComment({
        id: 2,
        ownerId: 58026024,
        comment: 'test updated',
      }
      );
      const expected = 5;
      assert.deepStrictEqual(actual, expected);
    });

    it('should not update if the comment id invalid', async() => {
      await knexDataStore.updateComment({
        id: -1,
        ownerId: 58026024,
        comment: 'test',
      }
      ).catch(err => assert.match(err, /Error/));
    });

    it('should not update if the comment owner id mismatch', async() => {
      await knexDataStore.updateComment({
        id: 1,
        ownerId: 58026024,
        comment: 'test',
      }
      ).catch(err => assert.match(err, /Error/));
    });
  });

  context('updateAcceptAnswer', () => {
    it('should update isAccepted of the answer', async() => {
      const actual = await knexDataStore.updateAcceptAnswer(
        {
          isAccepted: 1
        },
        1
      );
      const expected = 1;
      assert.deepStrictEqual(actual, expected);
      
    });

    it('should not accept a answer if response id invalid', async() => {
      await knexDataStore.updateAcceptAnswer(
        {
          isAccepted: 1
        },
        -1
      ).catch(err => assert.match(err, /Error/));
    });
  });

  context('updateVote', () => {
    it('should update vote of the response', async() => {
      const actual = await knexDataStore.updateVote(
        {
          ownerId: 58026024,
          responseId: 1,
          type: 1,
          vote: 1
        },
        'questions'
      );
      const expected = { vote: 3, type: 1 };
      assert.deepStrictEqual(actual, expected);
    });

    it('should down vote the response when it is given up vote', async() => {
      const actual = await knexDataStore.updateVote(
        {
          ownerId: 58027206,
          responseId: 1,
          type: 1,
          vote: -1
        },
        'questions'
      );
      const expected = { vote: 1, type: 0 };
      assert.deepStrictEqual(actual, expected);
      
    });

    it('should not up vote the response when it is given up vote', async() => {
      const actual = await knexDataStore.updateVote(
        {
          ownerId: 58027206,
          responseId: 1,
          type: 1,
          vote: 1
        },
        'questions'
      );
      const expected = { vote: 2, type: 1 };
      assert.deepStrictEqual(actual, expected);
      
    });

    it('should not update vote if response id invalid', async() => {
      await knexDataStore.updateVote(
        {
          responseId: -1
        },
        'questions'
      ).catch(err => assert.match(err, /Error/));
    });
  });
});
