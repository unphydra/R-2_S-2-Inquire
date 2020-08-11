const sinon = require('sinon');
const knexDataStore = require('../library/knexDataStore');

const oneQuestionDetails = [
  {
    id: 2,
    ownerId: 123,
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
];

const oneCommentDetails = [
  {
    id: 2,
    ownerId: 123,
    responseId: 1,
    comment: 'test',
    type: 0,
    receivedAt: '2020-08-07 12:21:42',
    modifiedAt: '2020-08-07 12:21:42',
    username: 'unphydra'
  }
];

module.exports = {
  fakeGetAllQuestion: () => {
    sinon.replace(
      knexDataStore, 'getAllQuestions', sinon.fake.returns(oneQuestionDetails)
    );
  },
  stubGetUser: () => {
    const stubGetUser = sinon.stub();
    sinon.replace(knexDataStore, 'getUser', stubGetUser);
    stubGetUser
      .withArgs(123)
      .returns(
        [{ name: 'test', username: 'test', avatar: 'test', id: '12345' }]
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
        voteDetails: { voteType: 0 },
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
            voteDetails: { voteType: 0 },
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
            voteDetails: { voteType: 0 },
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
  },
  stubGetAllTags: () => {
    const fakeGetAllTags = sinon.stub();
    fakeGetAllTags.withArgs().returns([{ id: 1, title: 'abc' }]);
    sinon.replace(knexDataStore, 'getAllTags', fakeGetAllTags);
  },
  stubGetYourQuestions: () => {
    const fakeGetYourQuestions = sinon.stub();
    fakeGetYourQuestions.withArgs(123).returns(oneQuestionDetails);
    sinon.replace(knexDataStore, 'getYourQuestions', fakeGetYourQuestions);
  },
  stubAllQuestionsYouAnswered: () => {
    const fakeAllQuestionsYouAnswered = sinon.stub();
    fakeAllQuestionsYouAnswered.withArgs(123).returns(oneQuestionDetails);
    sinon.replace(
      knexDataStore, 'allQuestionsYouAnswered', fakeAllQuestionsYouAnswered
    );
  },
  stubGetYourQuestionDetails: () => {
    const fakeGetYourQuestionDetails = sinon.stub();
    fakeGetYourQuestionDetails.withArgs(1, 123).returns(oneQuestionDetails);
    sinon.replace(
      knexDataStore, 'getYourQuestionDetails', fakeGetYourQuestionDetails
    );
  },
  stubGetYourTags: () => {
    const fakeGetYourTags = sinon.stub();
    fakeGetYourTags
      .withArgs(123)
      .onFirstCall().returns([{tags: [{title: 'javascript'}]}])
      .onSecondCall().returns([]);
    sinon.replace(
      knexDataStore, 'getYourTags', fakeGetYourTags
    );
  },
  stubAddNewUser: () => {
    const fakeAddNewUser = sinon.fake.returns();
    sinon.replace(knexDataStore, 'addNewUser', fakeAddNewUser);
  },
  stubInsertNewQuestion: () => {
    const fakeInsertNewQuestion = sinon.fake.returns(3);
    sinon.replace(knexDataStore, 'insertNewQuestion', fakeInsertNewQuestion);
  },
  stubUpdateQuestion: () => {
    const fakeUpdateQuestion = sinon.stub();
    fakeUpdateQuestion
      .withArgs(
        {
          id: -1,
          ownerId: 123,
          title: 'title',
          body: 'body'
        },
        ['js', 'java'])
      .throws(new Error('error'));
    fakeUpdateQuestion
      .withArgs(
        {
          id: 1,
          ownerId: 123,
          title: 'title',
          body: 'body'
        },
        ['js', 'java']
      )
      .returns();
    sinon.replace(knexDataStore, 'updateQuestion', fakeUpdateQuestion);
  },
  stubInsertNewAnswer: () => {
    const fakeInsertNewAnswer = sinon.stub();
    fakeInsertNewAnswer
      .withArgs({ ownerId: 123, questionId: 1, answer: 'test' })
      .returns();
    fakeInsertNewAnswer
      .withArgs({ ownerId: 123, questionId: -1, answer: 'test' })
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'insertNewAnswer', fakeInsertNewAnswer);
  },
  stubUpdateAnswer: () => {
    const fakeUpdateAnswer = sinon.stub();
    fakeUpdateAnswer
      .withArgs({ id: 1, ownerId: 123, answer: 'test' })
      .returns();
    fakeUpdateAnswer
      .withArgs({ id: -1, ownerId: 123, answer: 'test' })
      .throws(new Error('error'));
    sinon.replace( knexDataStore, 'updateAnswer', fakeUpdateAnswer );
  },
  stubInsertNewComment: () => {
    const fakeInsertNewComment = sinon.stub();
    fakeInsertNewComment
      .withArgs(
        {
          ownerId: 123,
          responseId: 1,
          comment: 'test',
          type: 1
        },
        'questions'
      )
      .returns(oneCommentDetails);
    fakeInsertNewComment
      .withArgs(
        {
          ownerId: 123,
          responseId: -1,
          comment: 'test',
          type: 1
        },
        'questions'
      )
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'insertNewComment', fakeInsertNewComment);
  },
  stubUpdateComment: () => {
    const fakeUpdateComment = sinon.stub();
    fakeUpdateComment
      .withArgs({ id: 2, ownerId: 123, comment: 'test'})
      .returns(oneCommentDetails);
    fakeUpdateComment
      .withArgs({id: -1, ownerId: 123, comment: 'test'})
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'updateComment', fakeUpdateComment);
  },
  stubUpdateAcceptAnswer: () => {
    const fakeUpdateAcceptAnswer = sinon.stub();
    fakeUpdateAcceptAnswer
      .withArgs({ isAccepted: 1 }, 1, 123)
      .returns(1);
    fakeUpdateAcceptAnswer
      .withArgs({ isAccepted: 1 }, -1, 123)
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'updateAcceptAnswer', fakeUpdateAcceptAnswer);
  },
  stubUpdateVote: () => {
    const fakeUpdateVote = sinon.stub();
    fakeUpdateVote
      .withArgs(
        {
          ownerId: 123,
          responseId: 1,
          type: 0,
          vote: 1
        },
        'answers'
      )
      .returns({ vote: 2, type: 1 });
    fakeUpdateVote
      .withArgs(
        {
          ownerId: 123,
          responseId: -1,
          type: 0,
          vote: 1
        },
        'answers'
      )
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'updateVote', fakeUpdateVote);
  },
  stubDeleteComment: () => {
    const fakeDeleteComment = sinon.stub();
    fakeDeleteComment
      .withArgs({id: 1, ownerId: 123})
      .returns(1);
    fakeDeleteComment
      .withArgs({id: 2, ownerId: 123})
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'deleteComment', fakeDeleteComment);
  },
  stubDeleteAnswer: () => {
    const fakeDeleteAnswer = sinon.stub();
    fakeDeleteAnswer
      .withArgs({id: 1, ownerId: 123})
      .returns(1);
    fakeDeleteAnswer
      .withArgs({id: 2, ownerId: 123})
      .throws(new Error('error'));
    sinon.replace(knexDataStore, 'deleteAnswer', fakeDeleteAnswer);
  }
};
