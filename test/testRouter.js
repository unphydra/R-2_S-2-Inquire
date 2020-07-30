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
        .fake
        .returns(
          Promise.resolve(
            { name: 'test', username: 'test', avatar: 'test', id: '12345'}
          )
        ),
      saveComment: async () => 'c00001',
      getRow: async () => true,
      insertAnswer: async () => 'a00001',
      insertQuestion: async () => 'q00001',
      insertTags: async () => undefined,
      acceptAnswer: async () => 1,
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

  context('postQuestion', function () {
    it('should give unauthorized error if session id is absent', (done) => {
      const body = { title: 'title', body: 'body', tags: 'js java' };
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
      const body = { title: 'title', body: 'body', tags: 'js java' };
      request(app)
        .post('/postQuestion')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(302, done);
    });
  });

  context('servePostQuestionPage', function () {
    it('should give the postQuestion Page', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      request(app).get('/askQuestion').expect(200, done);
    });
  });

  context('serveLoginPage', function () {
    it('should give the login page', (done) => {
      request(app).get('/loginPage').expect(200, done);
    });
  });

  context('postAnswer', function () {
    it('should give unauthorized error if session id is absent', (done) => {
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = {};
        next();
      });
      const body = { title: 'title', body: 'body', tags: 'js java' };
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
      const body = { title: 'title', body: 'body', tags: 'js java' };
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
      const body = { title: 'title', body: 'body', tags: 'js java' };
      request(app)
        .post('/postAnswer/q00001')
        .set('content-type', 'application/json')
        .send(JSON.stringify(body))
        .expect(400, done);
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

  context('acceptAnswer', function () {
    it('should accept the answer for given answerId and questionId', (done) => {
      app.locals.dataStore.getRow = sinon.mock().returns({ownerId: 'u123'});
      app.set('sessionMiddleware', (req, res, next) => {
        req.session = { id: '123' };
        next();
      });
      request(app)
        .post('/acceptAnswer/q00001/a00001')
        .expect(302, done);
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
});
