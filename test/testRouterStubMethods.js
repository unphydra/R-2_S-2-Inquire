const sinon = require('sinon');
const knexDataStore = require('../library/knexDataStore');

module.exports = {
  fakeGetAllQuestion: () => {
    sinon.replace(knexDataStore, 'getAllQuestions', sinon.fake.returns(
      [
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
        }
      ]
    ));
  },
  stubGetUser: () => {
    const stubGetUser = sinon.stub();
    sinon.replace(knexDataStore, 'getUser', stubGetUser);
    stubGetUser.withArgs(123)
      .returns(
        Promise.resolve(
          [{ name: 'test', username: 'test', avatar: 'test', id: '12345' }]
        )
      );
    stubGetUser.withArgs().returns([]);
    stubGetUser.withArgs(12345).returns([]);
  },
  stubGetQuestion: () => {
    const fakeGetQuestion = sinon.stub();
    fakeGetQuestion.withArgs(-1).throws(new Error('error'));
    fakeGetQuestion.withArgs(1)
      .returns(Promise.resolve({
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
        type: { type: 0 },
        tags: [{ title: 'node' }, { title: 'node-net' }],
        isAnsAccepted: [{ isAnsAccepted: 1 }],
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
            type: { type: 0 },
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
            type: { type: 0 },
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
      }));
    sinon.replace(knexDataStore, 'getQuestionDetails', fakeGetQuestion);
  }
};
