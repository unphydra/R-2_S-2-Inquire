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
      const stub = sinon.stub();
      stub.withArgs(undefined).returns(Promise.resolve(
        { name: 'test', username: 'test', avatar: 'test', id: '12345'}));
      stub.withArgs(123).returns(undefined);
      app.locals.dataStore.findUser = stub;
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
  beforeEach(() => {
    app.locals.dataStore = {
      getAllQuestions: sinon.mock().returns([
        {
          answers: 1,
          id: 'q00001',
          tags: ['java', 'javaScript'],
          title: 'what is sqlite?',
          votes: -1,
          ownerId: 'u58026024',
          ownerName: 'unphydra',
          receivedAt: '2020-07-25 15:14:36',
        },
      ]),
      getAllAnsweredQuestions: sinon.mock().returns([
        {
          id: 'q00002',
          answerId: 'a00002',
          tags: ['node'],
          title: 'what is the most powerful thing in database?',
          isAccepted: 0,
          ownerId: 'u58027206',
          ownerName: 'satheesh-chandran',
          receivedAt: '2020-07-25 15:14:36',
        },
      ]),
      getQuestionDetails: sinon
        .mock()
        .returns(Promise.resolve({
          id: 'q00001',
          title: 'what is sqlite?',
          body: 'i want to know about sqlite',
          votes: -1,
          receivedAt: '2020-07-25 15:14:36',
          modifiedAt: '2020-07-25 15:14:36',
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
              ownerInfo: {
                avatar: 'https://avatars3.githubusercontent.com/u/58027206?v=4',
                id: 'u58027206',
                username: 'satheesh-chandran'
              },
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
        })),
      findUser: sinon
        .fake
        .returns(
          Promise.resolve(
            { name: 'test', username: 'test', avatar: 'test', id: '12345'}
          )
        ),
      getRow: sinon.mock().returns({ ownerId: 'u123' }),
      getTable: sinon.mock().returns([]),
    };
  });

  afterEach(() => sinon.restore());

  context('/yourQuestions', function () {
    it('should give the yourQuestion page ', function (done) {
      this.timeout(5000);
      app.locals.dataStore.getRow = sinon.mock().returns({ ownerId: 'u123' });
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
      this.timeout(5000);
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
        req.session = { id: '123' };
        next();
      });
      request(app)
        .get('/askQuestion')
        .expect(200, done);
    });
  });

  context('/editQuestion', function () {
    it('should give the editQuestion Page', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
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
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u122'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .get('/editQuestion/q00001')
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
    updateAcceptAnswer: sinon.stub()
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
      ).returns();
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/postComment/1/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test', responseId: 1}))
        .expect('Location', '/question/1')
        .expect(302, done);
    });

    it('should give the unauthorized error if id is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      request(app)
        .post('/postComment/1/questions')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment' }))
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
        .post('/postComment/1/questions')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test', responseId: -1 }))
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

  context.skip('Voting', () => {
    it('should upVote a question', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      app.locals.dataStore = {
        getVoteLog: sinon.fake.returns(undefined),
        updateResponseVote: sinon.fake.returns(),
        insertToVoteLog: sinon.fake.returns(),
        getVoteCount: sinon.fake.returns({votes: 1})
      };

      request(app)
        .post('/upVote/questions/q00001')
        .end((err, res) => {
          assert.deepStrictEqual(
            res.headers['content-type'], 
            'application/json; charset=utf-8'
          );
          assert.deepStrictEqual(res.status, statusCodes.ok);
          assert.deepStrictEqual(res.body, {votes: 1});
          assert.ifError(err);
          const {
            getVoteLog,
            updateResponseVote,
            insertToVoteLog, 
            getVoteCount
          } = app.locals.dataStore;
          sinon.assert.calledWith(getVoteLog, '123', 'q00001');
          sinon.assert.calledWith(updateResponseVote, 'questions', 'q00001', 1);
          sinon.assert.calledWith(insertToVoteLog, '123', 'q00001', 1);
          sinon.assert.calledWith(getVoteCount, 'questions', 'q00001');
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {};
            next();
          });
          done();
        });
    });

    it('should give empty when question is already upVoted', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      app.locals.dataStore = {
        getVoteLog: sinon.fake.returns({vote: 1}),
      };

      request(app)
        .post('/upVote/questions/q00001')
        .end((err, res) => {
          assert.deepStrictEqual(
            res.headers['content-type'], 
            'application/json; charset=utf-8'
          );
          assert.deepStrictEqual(res.status, statusCodes.ok);
          assert.deepStrictEqual(res.body, {});
          assert.ifError(err);
          const {
            getVoteLog,
          } = app.locals.dataStore;
          sinon.assert.calledWith(getVoteLog, '123', 'q00001');
          sinon.assert.calledOnce(getVoteLog);
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {};
            next();
          });
          done();
        });
    });

    it('should upVote a question is already downVoted', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      app.locals.dataStore = {
        getVoteLog: sinon.fake.returns({vote: 0}),
        updateResponseVote: sinon.fake.returns(),
        deleteVoteLog: sinon.fake.returns(),
        getVoteCount: sinon.fake.returns({votes: 0})
      };

      request(app)
        .post('/upVote/questions/q00001')
        .end((err, res) => {
          assert.deepStrictEqual(
            res.headers['content-type'], 
            'application/json; charset=utf-8'
          );
          assert.deepStrictEqual(res.status, statusCodes.ok);
          assert.deepStrictEqual(res.body, {votes: 0});
          assert.ifError(err);
          const {
            getVoteLog,
            updateResponseVote,
            deleteVoteLog, 
            getVoteCount
          } = app.locals.dataStore;
          sinon.assert.calledWith(getVoteLog, '123', 'q00001');
          sinon.assert.calledWith(updateResponseVote, 'questions', 'q00001', 1);
          sinon.assert.calledWith(deleteVoteLog, '123', 'q00001');
          sinon.assert.calledWith(getVoteCount, 'questions', 'q00001');
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {};
            next();
          });
          done();
        });
    });

    it('should give bad request if type is given wrong', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      app.locals.dataStore = {
        getVoteLog: sinon.fake.returns({vote: 1}),
        updateResponseVote: sinon.fake.returns(new Error('no such table')),
      };
      request(app)
        .post('/downVote/test/q00001')
        .end((err, res) => {
          assert.deepStrictEqual(
            res.headers['content-type'], 
            'text/html; charset=utf-8'
          );
          assert.deepStrictEqual(res.text, 'bad request');
          assert.deepStrictEqual(res.status, statusCodes.badRequest);
          assert.ifError(err);
          const {
            getVoteLog,
            updateResponseVote,
          } = app.locals.dataStore;
          sinon.assert.calledWith(getVoteLog, '123', 'q00001');
          sinon.assert.calledWith(updateResponseVote, 'test', 'q00001', -1);
          app.set('sessionMiddleware', (req, res, next) => {
            req.session = {};
            next();
          });
          done();
        });
    });
  });
});
