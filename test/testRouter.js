const request = require('supertest');
const nock = require('nock');
require('dotenv').config({ path: './.env' });
const sinon = require('sinon');
const { app } = require('../src/router');
const statusCodes = { ok: 200, redirect: 302, badRequest: 400, notFound: 404 };

describe('get', function () {
  beforeEach(() => {
    app.locals.dataStore = {
      getAllQuestions: sinon.mock().returns([
        {
          answers: 1,
          id: 'q00001',
          tags: ['java', 'javaScript'],
          title: 'what is sqlite?',
          votes: -1,
        },
      ]),
      addNewUser: sinon.mock().returns(),
      findUser: sinon
        .mock()
        .returns({ name: 'test', username: 'test', avatar: 'test' }),
      getQuestionDetails: sinon
        .mock()
        .returns(Promise.resolve({ question: 'questionDetails' })),
    };
  });

  afterEach(() => sinon.restore());

  context('home', function () {
    it('should give the home.html page ', function (done) {
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

  context('registerNewUser', () => {
    it('should redirected to the home page when registered', (done) => {
      const body = JSON.stringify({ name: 'test', username: 'test' });
      request(app)
        .post('/newProfile')
        .set('content-type', 'application/json')
        .send(body)
        .expect(statusCodes.redirect, done);
    });

    it('should give bad request when name & username is absent', (done) => {
      request(app).post('/newProfile').expect(statusCodes.badRequest, done);
    });
  });

  context('viewProfile', () => {
    it('should get the view profile page', (done) => {
      request(app)
        .get('/viewProfile')
        .query({ id: 123 })
        .expect(statusCodes.ok)
        .expect('Content-Type', 'text/html; charset=UTF-8', done);
    });

    it('should not get the view profile page when id is absent', (done) => {
      request(app).get('/viewProfile').expect(statusCodes.badRequest, done);
    });
  });

  context('getProfile', () => {
    it('should get the profile details', (done) => {
      request(app)
        .get('/getProfile')
        .query({ id: 123 })
        .expect(statusCodes.ok)
        .expect('Content-Type', /application\/json/, done);
    });

    it('should not get the profile details when id is absent', (done) => {
      request(app).get('/getProfile').expect(statusCodes.badRequest, done);
    });

    it('should not get profile details when user is not present', (done) => {
      app.locals.dataStore.findUser = sinon.mock().returns();
      request(app)
        .get('/getProfile')
        .query({ id: 123 })
        .expect(statusCodes.notFound, done);
    });
  });

  context('serveQuestionPage', () => {
    it('should get the question page', (done) => {
      request(app)
        .get('/question/q00001')
        .expect(statusCodes.ok)
        .expect('Content-Type', /text\/html/, done);
    });
  });

  context('serveQuestionDetails', () => {
    it('should get the question details', (done) => {
      request(app)
        .get('/questionDetails/q00001')
        .expect(statusCodes.ok)
        .expect('Content-Type', /application\/json/, done);
    });

    it('should not get the question details', (done) => {
      app.locals.dataStore.getQuestionDetails = sinon
        .mock()
        .throws(new Error('notFound'));
      request(app)
        .get('/questionDetails/qabcd1')
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
        .reply(200, {['access_token']: '54321'});

      nock('https://api.github.com')
        .get('/user')
        .reply(200, {id: '12345', avatar: 'avatar'});
      
      app.locals.dataStore.findUser = sinon.mock().returns();

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(200, done);
    });

    it('should redirect to home page when user is registered', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, {['access_token']: '54321'});

      nock('https://api.github.com')
        .get('/user')
        .reply(200, {id: '58026024', avatar: 'avatar'});
      
      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/plain/)
        .expect(302, done);
    });

    it('should give bad request when req with bad code', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, {['access_token']: undefined});

      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });

    it('should give bad request when there is no user info', (done) => {
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, {['access_token']: '54321'});

      nock('https://api.github.com')
        .get('/user')
        .reply(200);
      
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
        .reply(200, {['access_token']: '54321'});

      nock('https://api.github.com')
        .get('/user')
        .replyWithError(new Error('no user Info'));
      
      request(app)
        .get('/user/auth')
        .expect('content-type', /text\/html/)
        .expect(400, done);
    });
  });
});
