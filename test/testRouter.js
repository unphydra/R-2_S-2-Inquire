const request = require('supertest');
const nock = require('nock');
require('dotenv').config({ path: './.env' });
const sinon = require('sinon');
const { app } = require('../src/router');
const { assert } = require('chai');
const knexDataStore = require('../library/knexDataStore');
const statusCodes = { ok: 200, redirect: 302, badRequest: 400, notFound: 404 };

describe('-- Public get methods --', function() {
  beforeEach(() => {
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
          isAnsAccepted: [{isAnsAccepted: 1}],
          tags: [{ title: 'node' }, { title: 'node-net' }]
        }
      ]
    ));
    const stubGetUser = sinon.stub();
    sinon.replace(knexDataStore, 'getUser', stubGetUser);
    stubGetUser.withArgs(123)
      .returns(
        Promise.resolve(
          [{ name: 'test', username: 'test', avatar: 'test', id: '12345'}]
        )
      );
    stubGetUser.withArgs().returns([]);
    stubGetUser.withArgs(12345).returns([]);

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
      }));
      
    sinon.replace(knexDataStore, 'getQuestionDetails', fakeGetQuestion);
    sinon.replace(knexDataStore, 'addNewUser', sinon.mock().returns());
  });

  afterEach(() => sinon.restore());

  context('home', function () {
    it('should give the home.html page ', function (done) {
      this.timeout(5000);
      request(app)
        .get('/home')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/Your Questions/, done);
    });
  });

  context('reqLogin', () => {
    it('should redirect to github authenticate page', (done) => {
      request(app)
        .get('/login')
        .expect('location', /github/)
        .expect(statusCodes.redirect, done);
    });
  });

  context('viewProfile', () => {
    it('should get the view profile page', (done) => {
      request(app)
        .get('/viewProfile')
        .query({ id: 123 })
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/, done);
    });

    it('should not get the view profile page when id is absent', (done) => {
      request(app).get('/viewProfile').expect(statusCodes.badRequest, done);
    });

    it('should give not found for wrong user id', (done) => {
      request(app)
        .get('/viewProfile')
        .query({ id: 123 })
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/no user found/, done);
    });
  });

  context('serveQuestionPage', () => {
    it('should get the question page', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {id: 123};
        next();
      });
      request(app)
        .get('/question/1')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/, done);
    });

    it('should give not found when question id invalid', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      request(app)
        .get('/question/-1')
        .expect(statusCodes.badRequest)
        .expect('Content-Type', /text\/html/, done);
    });
  });

  context('cancelRegistration', () => {
    it('should redirect to home page after clearing the cookie', (done) => {
      request(app)
        .get('/cancel')
        .expect(statusCodes.redirect)
        .expect('content-type', /text\/plain/, done);
    });
  });

  context('handle Login', () => {
    it('should redirect to new Profile when user is new', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .reply(200, { id: 12345, avatar: 'avatar' });
      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(200, done);
    });

    it('should redirect to home page when user is registered', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .reply(200, { id: 123, avatar: 'avatar' });

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/plain/)
        .expect(302, done);
    });

    it('should give bad request when req with bad code', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, { ['access_token']: undefined });

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });

    it('should give bad request when there is no user info', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, { ['access_token']: '54321' });

      nock('https://api.github.com').get('/user').reply(200);

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });

    it('should give bad request when req for token', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .replyWithError(new Error('bad'));

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });

    it('should give bad request when req for user info', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .replyWithError(new Error('no user Info'));

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });
  });

  context('serveLoginPage', function () {
    it('should give the login page', (done) => {
      request(app).get('/loginPage').expect(200, done);
    });
  });
});

describe('-- Private get methods --', function() {
  
  const stubGetAllQuestions = sinon.stub();
  const stubGetAllTags = sinon.stub();
  const stubGetYourQuestions = sinon.stub();
  const stubAllQuestionsYouAnswered = sinon.stub();
  const stubGetUser = sinon.stub();
  const stubGetYourQuestionDetails = sinon.stub();
  
  before(() => {

    sinon.replace(knexDataStore, 'getAllQuestions', stubGetAllQuestions);
    sinon.replace(knexDataStore, 'getAllTags', stubGetAllTags);
    sinon.replace(knexDataStore, 'getYourQuestions', stubGetYourQuestions);
    sinon.replace(
      knexDataStore, 'allQuestionsYouAnswered', stubAllQuestionsYouAnswered
    );
    sinon.replace(knexDataStore, 'getUser', stubGetUser);
    sinon.replace(
      knexDataStore, 'getYourQuestionDetails', stubGetYourQuestionDetails
    );
    
    stubGetAllQuestions.withArgs().returns([
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
      }
    ]);

    stubGetUser.withArgs(123)
      .returns(
        Promise.resolve(
          [{ name: 'test', username: 'test', avatar: 'test', id: '12345'}]
        )
      );
    stubGetUser.withArgs().returns([]);
    stubGetUser.withArgs(12345).returns([]);

    stubGetYourQuestionDetails.withArgs(1).returns(
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
          tags: [{ title: 'node' }, { title: 'node-net' }],
          isAnsAccepted: [{isAnsAccepted: 1}]
        }
      ]
    );
    stubGetAllTags.withArgs().returns(['abc']);
    stubGetYourQuestions.withArgs(123).returns([
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
        isAnsAccepted: [{isAnsAccepted: 1}],
        tags: [{ title: 'node' }, { title: 'node-net' }]
      }
    ]);

    stubAllQuestionsYouAnswered.withArgs(123).returns([
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
        isAnsAccepted: [{isAnsAccepted: 1}],
        tags: [{ title: 'node' }, { title: 'node-net' }]
      }
    ]);
  });

  after(() => sinon.restore());

  context('/yourQuestions', function () {
    it('should give the yourQuestion page ', function (done) {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .get('/yourQuestions')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/Your Questions/, done);
    });
  });
  
  context('/yourAnswers', function () {
    it('should give the your answers page ', function (done) {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .get('/yourAnswers')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/Your Answers/, done);
    });
  });

  context('/askQuestion', function () {
    it('should give the postQuestion Page', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .get('/askQuestion')
        .expect(200, done);
    });
  });

  context('/editQuestion', function () {
    it('should give the editQuestion Page', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .get('/editQuestion/1')
        .expect(200)
        .expect(/question/, done);
    });

    it('should give error for wrong questionId', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .get('/editQuestion/-1')
        .expect(400)
        .expect(/bad request/, done);
    });
  });
});

describe('-- post methods --', function () {
  const fakeFunctions = {
    addNewUser: sinon.fake.returns(),
    getUser: sinon.stub(),
    insertNewQuestion: sinon.fake.returns(3),
    updateQuestion: sinon.stub(),
    insertNewAnswer: sinon.stub(),
    updateAnswer: sinon.stub(),
    insertNewComment: sinon.stub(),
    updateComment: sinon.stub(),
    updateAcceptAnswer: sinon.stub(),
    updateVote: sinon.stub()
  };
  beforeEach(() => {
    fakeFunctions['getUser'].withArgs(123).returns(
      Promise.resolve(
        [{ name: 'test', username: 'test', avatar: 'test', id: '12345'}]
      )
    );
    fakeFunctions['getUser'].withArgs().returns([]);

    sinon.replace(knexDataStore, 'addNewUser', fakeFunctions['addNewUser']);
    sinon.replace(knexDataStore, 'getUser', fakeFunctions['getUser']);
    sinon.replace(
      knexDataStore, 'insertNewQuestion', fakeFunctions['insertNewQuestion']
    );
    sinon.replace(
      knexDataStore, 'updateQuestion', fakeFunctions['updateQuestion']
    );
    sinon.replace(
      knexDataStore, 'insertNewAnswer', fakeFunctions['insertNewAnswer']
    );
    sinon.replace(
      knexDataStore, 'updateAnswer', fakeFunctions['updateAnswer']
    );
    sinon.replace(
      knexDataStore, 'insertNewComment', fakeFunctions['insertNewComment']
    );
    sinon.replace(
      knexDataStore, 'updateComment', fakeFunctions['updateComment']
    );
    sinon.replace(
      knexDataStore, 'updateAcceptAnswer', fakeFunctions['updateAcceptAnswer']
    );
    sinon.replace( knexDataStore, 'updateVote', fakeFunctions['updateVote'] );
  });

  afterEach(() => sinon.restore());

  context('registerNewUser', () => {
    it('should redirected to the home page when registered', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      const body = JSON.stringify({ name: 'test', username: 'test' });
      request(app)
        .post('/newProfile')
        .set('content-type', 'application/json')
        .send(body)
        .expect(statusCodes.redirect, done);
    });

    it('should give bad request when name & username is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/newProfile')
        .expect(statusCodes.badRequest, done);
    });
  });

  context('postQuestion', function () {
    it('should give unauthorized error if session id is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/postQuestion')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(401, done);
    });

    it('should redirect to question page after insertion', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/postQuestion')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(302, done);
    });
  });

  context('updateQuestion', function () {
    it('should give bad request error for  wrong questionId', (done) => {
      fakeFunctions['updateQuestion'].withArgs({
        id: -1, 
        ownerId: 123, 
        title: 'title', 
        body: 'body'
      },
      ['js', 'java']
      ).throws(new Error('error'));
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/-1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(400, done);
    });

    it('should redirect to question page after update', (done) => {
      fakeFunctions['updateQuestion'].withArgs({
        id: 1, 
        ownerId: 123, 
        title: 'title', 
        body: 'body'
      },
      ['js', 'java']
      ).returns();
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(302, done);
    });
  });

  context('postAnswer', function () {
    it('should give unauthorized error if session id is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      const body = {};
      request(app)
        .post('/postAnswer/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(401, done);
    });

    it('should redirect to question page after insertion', (done) => {
      fakeFunctions['insertNewAnswer'].withArgs({ 
        ownerId: 123, 
        questionId: 1,
        answer: 'test'
      }).returns();
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      const body = {answer: 'test'};
      request(app)
        .post('/postAnswer/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(302, done);
    });

    it('should give badRequest error if the question is absent', (done) => {
      fakeFunctions['insertNewAnswer'].withArgs({ 
        ownerId: 123, 
        questionId: -1,
        answer: 'test'
      }).throws(new Error('error'));
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      const body = { answer: 'test' };
      request(app)
        .post('/postAnswer/-1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(400, done);
    });
  });

  context('updateAnswer', function () {
    it('should redirect after update the answer', (done) => {
      fakeFunctions['updateAnswer'].withArgs({ 
        id: 1,
        ownerId: 123, 
        answer: 'test'
      }).returns();
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test', answerId: 1, questionId: 1 }))
        .expect('Location', '/question/1')
        .expect(302, done);
    });

    it('should give the bad request error for wrong answerId', (done) => {
      fakeFunctions['updateAnswer'].withArgs({ 
        id: -1,
        ownerId: 123, 
        answer: 'test'
      }).throws(new Error('error'));
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test', answerId: -1, questionId: 1 }))
        .expect(400, done);
    });
  });

  context('postComment', function () {
    it('should redirect to the question page after insertion', (done) => {
      fakeFunctions['insertNewComment'].withArgs(
        {
          ownerId: 123,
          responseId: 1,
          comment: 'test',
          type: 1
        },
        'questions'
      ).returns([
        {
          id: 6,
          ownerId: 58026024,
          responseId: 1,
          comment: 'test',
          type: 1,
          receivedAt: '2020-08-07 12:21:42',
          modifiedAt: '2020-08-07 12:21:42',
          username: 'unphydra'
        }
      ]);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/postComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify(
          { comment: 'test', responseId: 1, table: 'questions', questionId: 1}
        ))
        .expect(200, done);
    });

    it('should give the unauthorized error if id is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      request(app)
        .post('/postComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify(
          { comment: 'test', responseId: 1, table: 'questions', questionId: 1}
        ))
        .expect(401, done);
    });

    it('should give bad request if response id is wrong', (done) => {
      fakeFunctions['insertNewComment'].withArgs(
        {
          ownerId: 123,
          responseId: -1,
          comment: 'test',
          type: 1
        },
        'questions'
      ).throws(new Error('error'));
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/postComment/')
        .set('content-type', 'application/json')
        .send(JSON.stringify(
          { comment: 'test', responseId: -1, table: 'questions', questionId: 1}
        ))
        .expect(400, done);
    });
  });

  context('updateComment', function () {
    it('should redirected to question page after update', (done) => {
      fakeFunctions['updateComment'].withArgs(
        {
          id: 2,
          ownerId: 123,
          comment: 'test',
        }
      ).returns();
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/updateComment/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test', commentId: 2 }))
        .expect('Location', '/question/1')
        .expect(302, done);
    });

    it('should give the bad request error for wrong commentId', (done) => {
      fakeFunctions['updateComment'].withArgs(
        {
          id: 2,
          ownerId: 123,
          comment: 'test',
        }
      ).throws(new Error('error'));
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      request(app)
        .post('/updateComment/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test', commentId: 2 }))
        .expect(400, done);
    });
  });

  context('acceptAnswer', function () {
    it('should accept the answer for given answerId and questionId', (done) => {
      fakeFunctions['updateAcceptAnswer'].withArgs(
        {
          isAccepted: 1
        },
        1,
        123
      ).returns();
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/acceptAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ qOwnerId: 123, answerId: 1 }))
        .expect(200)
        .expect('content-type', /application\/json/, done);
    });

    it('should give bad request error for wrong answerId', (done) => {
      fakeFunctions['updateAcceptAnswer'].withArgs(
        {
          isAccepted: 1
        },
        -1,
        123
      ).throws(new Error('error'));
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/acceptAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ qOwnerId: 123, answerId: -1 }))
        .expect(400, done);
    });
  });

  context('Voting', () => {
    it('should upVote a response', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 58027208 };
        next();
      });
      fakeFunctions.updateVote.withArgs({
        ownerId: 58027208,
        responseId: 1,
        type: 0,
        vote: 1
      }, 'answers').returns({ vote: 2, type: 1});

      request(app)
        .post('/upVote')
        .set('content-type', 'application/json')
        .send(JSON.stringify({table: 'answers', responseId: 1 }))
        .end((err, res) => {
          assert.deepStrictEqual(
            res.headers['content-type'], 
            'application/json; charset=utf-8'
          );
          assert.deepStrictEqual(res.status, 200);
          assert.deepStrictEqual(res.body, {vote: 2, type: 1});
          assert.ifError(err);
          done();
        });
    });

    it('should give bad request if type is given wrong', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 58027206 };
        next();
      });
      fakeFunctions.updateVote.withArgs({
        ownerId: 58027206,
        responseId: 1,
        type: 0,
        vote: 1
      }, 'answers').throws(new Error('error'));
      request(app)
        .post('/upVote')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ table: 'answers', responseId: 1 }))
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });
  });
});
