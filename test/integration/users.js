var request = require('../../lib/request')
  , Client = require('../../app/models/client');

var user = {
  name: "Test User",
  email: "test@user.com",
  password: "helloworld"
};

var official, thirdparty;

describe('Users:', function() {
  before(function(done) {
    official = new Client({ name: "official" });
    official.trusted = true;
    official.save(done);
  });

  before(function(done) {
    thirdparty = new Client({ name: "thirdparty" });
    thirdparty.save(done);
  });

  describe('a thrid-party client', function() {
    describe("POST /users", function() {
      it('should not register a user', function(done) {
        request(thirdparty).post('/users', user, function(res, body) {
          res.should.have.status(403);
          body.should.have.keys('error', 'message');
          body.error.should.equal('forbidden_request');
          done();
        });
      });
    });
  });

  describe('an official client', function() {
    describe('POST /users', function() {
      it('should successfully register a user', function(done) {
        request(official).post('/users', user, function(res, body) {
          res.should.have.status(201);
          body.should.have.keys('id', 'name', 'email');
          body.name.should.equal(user.name);
          body.email.should.equal(user.email);
          done();
        });
      });
    });
  });
});
