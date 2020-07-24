const request = require('supertest');
require('dotenv').config({ path: './.env' });
const { app } = require('../src/router');
const statusCodes = { ok: 200 };

describe('get', function () {
  context('home', function () {
    it('should give the home.html page ', function (done) {
      request(app)
        .get('/home')
        .expect(statusCodes.ok)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/Your Questions/);
    });
  });
  context('questions', function () {
    it('should give the allquestion details ', function (done) {
      request(app)
        .get('/questions')
        .expect(statusCodes.ok)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/answers/);
    });
  });
});
