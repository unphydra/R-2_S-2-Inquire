const request = require('supertest');
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
});
