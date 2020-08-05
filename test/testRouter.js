const request = require('supertest');
const nock = require('nock');
require('dotenv').config({ path: './.env' });
const sinon = require('sinon');
const { app } = require('../src/router');
const { assert } = require('chai');
const statusCodes = { ok: 200, redirect: 302, badRequest: 400, notFound: 404 };

describe('-- Public get methods --', function() {
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
      addNewUser: sinon.mock().returns(),
      findUser: sinon
        .fake
        .returns(
          Promise.resolve(
            { name: 'test', username: 'test', avatar: 'test', id: '12345'}
          )
        ),
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
    };
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
      request(app)
        .get('/question/q00001')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .end(() => {
          sinon.assert.calledTwice(app.locals.dataStore.findUser);
          done();
        });
    });

    it('should give not found when question id invalid', (done) => {
      app.locals.dataStore.getQuestionDetails = sinon
        .mock()
        .throws(new Error('notFound'));
      request(app)
        .get('/question/qabcd1')
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
        .reply(200, { id: '12345', avatar: 'avatar' });

      app.locals.dataStore.findUser = sinon.mock().returns();

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
        .reply(200, { id: '58026024', avatar: 'avatar' });

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
        .get('/editQuestion/q00001')
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
        .expect(405)
        .expect(/Your are not a question owner/, done);
    });
  });
});

describe('-- post methods --', function () {
  beforeEach(() => {
    app.locals.dataStore = {
      addNewUser: sinon.mock().returns(),
      findUser: sinon
        .fake
        .returns(
          Promise.resolve(
            { name: 'test', username: 'test', avatar: 'test', id: '12345'}
          )
        ),
      updateTags: sinon.mock().returns(['t00005', 't00003']),
      updateQuestion: sinon.mock().returns({
        id: 'q00001',
        ownerId: 'u58026024',
        title: 'what is sqlite3',
        body: 'i want to know about sqlite3',
        votes: -1,
        anyAnswerAccepted: 0,
        receivedAt: '2020-07-25 15:14:36',
        modifiedAt: '2020-07-25 15:14:36'
      }),
      saveComment: sinon.mock().returns('c00001'),
      updateComment: sinon.mock().returns({
        id: 'c00003',
        responseId: 'a00002',
        ownerId: 'u58027024',
        comment: 'It is right',
        receivedAt: '2020-07-25 15:14:36'
      }),
      getRow: sinon.mock().returns(true),
      insertAnswer: sinon.mock().returns('a00001'),
      updateAnswer: sinon.mock().returns({
        id: 'a00001',
        questionId: 'q00001',
        ownerId: 'u58027206',
        answer: 'search it on net',
        isAccepted: 0,
        votes: 0,
        receivedAt: '2020-07-25 15:14:36',
        modifiedAt: '2020-07-25 15:14:36'
      }),
      insertQuestion: sinon.mock().returns('q00001'),
      insertTags: sinon.mock().returns(undefined),
      acceptAnswer: sinon.mock().returns(1)
    };
  });

  afterEach(() => sinon.restore());

  context('registerNewUser', () => {
    it('should redirected to the home page when registered', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
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
        req.session = { id: '123' };
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
        req.session = { id: '123' };
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
      app.locals.dataStore.getRow = sinon.mock().returns(false);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(400, done);
    });

    it('should give error for wrong ownerId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ ownerId: 'u122'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(405, done);
    });

    it('should redirect to question page after updation', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/q00001')
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
        .post('/postAnswer/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(401, done);
    });

    it('should redirect to question page after insertion', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      const body = {answer: 'test'};
      request(app)
        .post('/postAnswer/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(302, done);
    });

    it('should give badRequest error if the question is absent', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns(false);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      const body = { answer: 'test' };
      request(app)
        .post('/postAnswer/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(400, done);
    });
  });

  context('updateAnswer', function () {
    it('should give updated answer row', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test comment', answerId: 'a00001' }))
        .expect(200)
        .expect(/search it on net/, done);
    });

    it('should give the bad request error for wrong answerId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns(undefined);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test answer', answerId: 'a00001' }))
        .expect(400, done);
    });

    it('should give the error for others answerId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ ownerId: 'u122'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test comment', answerId: 'c00003' }))
        .expect(405, done);
    });
  });

  context('postComment', function () {
    it('should redirect to the question page after insertion', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      request(app)
        .post('/postComment/q00001/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment' }))
        .expect(302, done);
    });

    it('should give the unauthorized error if id is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      request(app)
        .post('/postComment/q00001/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment' }))
        .expect(401, done);
    });

    it('should give the unauthorized error if id is absent', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns(false);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123'};
        next();
      });
      request(app)
        .post('/postComment/q00001/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment' }))
        .expect(400, done);
    });
  });

  context('updateComment', function () {
    it('should give updated comment row', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/updateComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment', commentId: 'c00003' }))
        .expect(200)
        .expect(/It is right/, done);
    });

    it('should give the bad request error for wrong commentId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns(undefined);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      request(app)
        .post('/updateComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment', commentId: 'c00003' }))
        .expect(400, done);
    });

    it('should give the error for others commentId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ ownerId: 'u122'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123};
        next();
      });
      request(app)
        .post('/updateComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test comment', commentId: 'c00003' }))
        .expect(405, done);
    });
  });

  context('acceptAnswer', function () {
    it('should accept the answer for given answerId and questionId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: 123 };
        next();
      });
      request(app)
        .post('/acceptAnswer/q00001/a00001')
        .expect(200)
        .expect('content-type', /application\/json/)
        .expect(/1/, done);
    });

    it('should give bad request error for wrong questionId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns(undefined);
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      request(app)
        .post('/acceptAnswer/q00001/a00001')
        .expect(400, done);
    });

    it('should give method not allowed error for wrong userId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '103' };
        next();
      });
      request(app)
        .post('/acceptAnswer/q00001/a00001')
        .expect(405, done);
    });
  });

  context('Voting', () => {
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
