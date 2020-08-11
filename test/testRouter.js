require('dotenv').config({ path: './.env' });
const request = require('supertest');
const nock = require('nock');
const sinon = require('sinon');
const { assert } = require('chai');
const { app } = require('../src/router');
const fakeDataStoreMethods = require('./testRouterStubMethods');
const statusCodes = {
  ok: 200,
  redirect: 302,
  badRequest: 400,
  unauthorized: 401
};

describe('-- PUBLIC GET METHODS --', function () {
  before(() => {
    fakeDataStoreMethods.fakeGetAllQuestion();
    fakeDataStoreMethods.stubGetUser();
    fakeDataStoreMethods.stubGetQuestion();
  });

  after(() => sinon.restore());

  context('home', function () {
    it('should give the home.html page ', function (done) {
      request(app)
        .get('/home')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/Home/, done);
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
      request(app)
        .get('/question/1')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/, done);
    });

    it('should give not found when question id invalid', (done) => {
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
        .reply(statusCodes.ok, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .reply(statusCodes.ok, { id: 12345, avatar: 'avatar' });
      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(statusCodes.ok, done);
    });

    it('should redirect to home page when user is registered', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(statusCodes.ok, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .reply(statusCodes.ok, { id: 123, avatar: 'avatar' });

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/plain/)
        .expect(statusCodes.redirect, done);
    });

    it('should give bad request when req with bad code', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(statusCodes.ok, { ['access_token']: undefined });

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(statusCodes.badRequest, done);
    });

    it('should give bad request when there is no user info', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(statusCodes.ok, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .replyWithError(new Error('bad'));

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(statusCodes.badRequest, done);
    });

    it('should give bad request when req for token', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .replyWithError(new Error('bad'));

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(statusCodes.badRequest, done);
    });

    it('should give bad request when req for user info', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(statusCodes.ok, { ['access_token']: '54321' });

      nock('https://api.github.com')
        .get('/user')
        .replyWithError(new Error('no user Info'));

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(statusCodes.badRequest, done);
    });
  });

  context('serveLoginPage', function () {
    it('should give the login page', (done) => {
      request(app).get('/loginPage').expect(statusCodes.ok, done);
    });
  });
});

describe('-- PRIVATE GET METHODS --', function () {
  before(() => {
    fakeDataStoreMethods.stubGetAllTags();
    fakeDataStoreMethods.stubGetYourQuestions();
    fakeDataStoreMethods.stubAllQuestionsYouAnswered();
    fakeDataStoreMethods.stubGetUser();
    fakeDataStoreMethods.stubGetYourQuestionDetails();
    fakeDataStoreMethods.stubGetYourTags();

    app.set('sessionMiddleware', (req, res, next) => {
      req.session = { id: 123 };
      next();
    });
  });

  after(() => sinon.restore());

  context('/yourQuestions', function () {
    it('should give the yourQuestion page ', function (done) {
      request(app)
        .get('/yourQuestions')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/what is the most powerful thing in database\?/, done);
    });
  });

  context('/yourAnswers', function () {
    it('should give the your answers page ', function (done) {
      request(app)
        .get('/yourAnswers')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/)
        .expect(/what is the most powerful thing in database\?/, done);
    });
  });

  context('/askQuestion', function () {
    it('should give the postQuestion Page', (done) => {
      request(app)
        .get('/askQuestion')
        .expect(/abc/)
        .expect(statusCodes.ok, done);
    });
  });

  context('/editQuestion', function () {
    it('should give the editQuestion Page', (done) => {
      request(app)
        .get('/editQuestion/1')
        .expect(/what is the most powerful thing in database\?/)
        .expect(statusCodes.ok, done);
    });

    it('should give error for wrong questionId', (done) => {
      request(app)
        .get('/editQuestion/-1')
        .expect(/bad request/)
        .expect(statusCodes.badRequest, done);
    });
  });

  context('/yourTags', function() {
    it('should give the yourTags page', (done) => {
      request(app)
        .get('/yourTags')
        .expect(/javascript/)
        .expect(statusCodes.ok, done);
    });

    it('should give the yourTags page without any tag', (done) => {
      request(app)
        .get('/yourTags')
        .expect(statusCodes.ok, done);
    });
  });
});

describe('-- POST METHODS --', function () {
  before(() => {
    fakeDataStoreMethods.stubAddNewUser();
    fakeDataStoreMethods.stubInsertNewQuestion();
    fakeDataStoreMethods.stubUpdateQuestion();
    fakeDataStoreMethods.stubInsertNewAnswer();
    fakeDataStoreMethods.stubUpdateAnswer();
    fakeDataStoreMethods.stubInsertNewComment();
    fakeDataStoreMethods.stubUpdateComment();
    fakeDataStoreMethods.stubUpdateAcceptAnswer();
    fakeDataStoreMethods.stubUpdateVote();

    app.set('sessionMiddleware', (req, res, next) => {
      req.session = { id: 123 };
      next();
    });
  });

  after(() => sinon.restore());

  context('registerNewUser', () => {
    it('should redirected to the home page when registered', (done) => {
      const body = JSON.stringify({ name: 'test', username: 'test' });
      request(app)
        .post('/newProfile')
        .set('content-type', 'application/json')
        .send(body)
        .expect('Location', '/')
        .expect(statusCodes.redirect, done);
    });

    it('should give bad request when name & username is absent', (done) => {
      request(app)
        .post('/newProfile')
        .expect(statusCodes.badRequest, done);
    });
  });

  context('postQuestion', function () {
    it('should redirect to question page after insertion', (done) => {
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/postQuestion')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect('Location', '/question/3')
        .expect(statusCodes.redirect, done);
    });
  });

  context('updateQuestion', function () {
    it('should give bad request error for  wrong questionId', (done) => {
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/-1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(statusCodes.badRequest, done);
    });

    it('should redirect to question page after update', (done) => {
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/updateQuestion/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect('Location', '/question/1')
        .expect(statusCodes.redirect, done);
    });
  });

  context('postAnswer', function () {
    it('should redirect to question page after insertion', (done) => {
      const body = { answer: 'test' };
      request(app)
        .post('/postAnswer/1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect('Location', '/question/1')
        .expect(statusCodes.redirect, done);
    });

    it('should give badRequest error if the question is absent', (done) => {
      const body = { answer: 'test' };
      request(app)
        .post('/postAnswer/-1')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(statusCodes.badRequest, done);
    });
  });

  context('updateAnswer', function () {
    it('should redirect after update the answer', (done) => {
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test', answerId: 1, questionId: 1 }))
        .expect('Location', '/question/1')
        .expect(statusCodes.redirect, done);
    });

    it('should give the bad request error for wrong answerId', (done) => {
      request(app)
        .post('/updateAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ answer: 'test', answerId: -1, questionId: 1 }))
        .expect(statusCodes.badRequest, done);
    });
  });

  context('postComment', function () {
    it('should redirect to the question page after insertion', (done) => {
      const body = {
        comment: 'test',
        responseId: 1,
        table: 'questions',
        questionId: 1
      };
      request(app)
        .post('/postComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(/test/)
        .expect(statusCodes.ok, done);
    });

    it('should give bad request if response id is wrong', (done) => {
      const body = {
        comment: 'test',
        responseId: -1,
        table: 'questions',
        questionId: 1
      };
      request(app)
        .post('/postComment/')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(statusCodes.badRequest, done);
    });
  });

  context('updateComment', function () {
    it('should redirected to question page after update', (done) => {
      request(app)
        .post('/updateComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test', commentId: 2 }))
        .expect(/test/)
        .expect(statusCodes.ok, done);
    });

    it('should give the bad request error for wrong commentId', (done) => {
      request(app)
        .post('/updateComment')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ comment: 'test', commentId: -1 }))
        .expect(statusCodes.badRequest, done);
    });
  });

  context('acceptAnswer', function () {
    it('should accept the answer for given answerId and questionId', (done) => {
      request(app)
        .post('/acceptAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ qOwnerId: 123, answerId: 1 }))
        .expect('content-type', /application\/json/)
        .expect(/"isAccepted":1/)
        .expect(statusCodes.ok, done);
    });

    it('should give bad request error for wrong answerId', (done) => {
      request(app)
        .post('/acceptAnswer')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ qOwnerId: 123, answerId: -1 }))
        .expect(statusCodes.badRequest, done);
    });
  });

  context('Voting', () => {
    it('should upVote a response', (done) => {
      request(app)
        .post('/upVote')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ table: 'answers', responseId: 1 }))
        .expect('content-type', /application\/json/)
        .expect(statusCodes.ok)
        .expect(/{"vote":2,"type":1}/)
        .then((res) => {
          assert.deepStrictEqual(res.body, { vote: 2, type: 1 });
          done();
        });
    });

    it('should give bad request for wrong responseId', (done) => {
      request(app)
        .post('/upVote')
        .set('content-type', 'application/json')
        .send(JSON.stringify({ table: 'answers', responseId: -1 }))
        .expect('content-type', /text\/html/)
        .expect(statusCodes.badRequest, done);
    });
  });

  context('isLoggedIn', () => {
    it('should give unauthorized error for not logged in user', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      const body = { title: 'title', body: 'body', tags: ['js', 'java'] };
      request(app)
        .post('/postQuestion')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(statusCodes.unauthorized, done);
    });
  });
});
