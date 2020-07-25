const request = require('supertest');
require('dotenv').config({ path: './.env' });
const sinon = require('sinon');
const { app } = require('../src/router');
const statusCodes = { ok: 200, redirect: 302 };

describe('get', function () {

  beforeEach(() => {
    app.locals.dataStore = {
      getAllQuestions: sinon.mock().returns(
        [{
          answers: 1,
          id: 'q00001',
          tags: ['java', 'javaScript'],
          title: 'what is sqlite?',
          votes: -1,
        }]
      )
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
      request(app)
        .get('/login')
        .expect(statusCodes.redirect, done);
    });
  });
});
