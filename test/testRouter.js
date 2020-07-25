const request = require('supertest');
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

  context('home', function () {
    it('should give the home.html page ', function (done) {
      request(app)
        .get('/home')
        .expect(statusCodes.ok)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/Your Questions/);
    });
  });

  context('serveQuestions', function () {
    it('should give the all question details ', function (done) {
      request(app)
        .get('/questions')
        .expect(statusCodes.ok)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/answers/);
    });
  });

  context('reqLogin', () => {
    it('should redirect to github authenticate page', (done) => {
      request(app).get('/login').expect(statusCodes.redirect, done);
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
});
