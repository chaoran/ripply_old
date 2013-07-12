var should = require('should')
  , request = require('../../lib/request')
  , Client = require('../../app/models/client');

var user = {
  username: "testuser",
  password: "helloworld",
  name: "Test User",
  bio: "I'm a happy man",
};

var official, thirdparty, token;

before(function() {
  require('../../bin/server');
});

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
          body.should.equal('Forbidden');
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
          body.should.have.keys('id', 'name', 'username', 'bio', 'createdAt');
          res.should.have.header('location', '/users/' + body.id);
          body.name.should.equal(user.name);
          body.username.should.equal(user.username);
          body.bio.should.equal(user.bio);

          user.id = body.id;

          done();
        });
      });
    });
  });

  describe('after acquiring an access token', function() {
    before(function(done) {
      request(official).post('/tokens', {
        username: user.username,
        password: user.password,
        grant_type: 'password',
      }, function(res, body) {
        res.should.have.status(200);
        body.should.have.keys(
          'access_token', 'expires_in', 'token_type', 'scope', 'refresh_token'
        );
        token = body;
        done();
      });
    });

    describe('PUT /users/:id/profile', function() {
      it('should update user profile', function(done) {
        var update = {
          email: 'new@email.com',
          phone: '123-456-7890',
          name: 'New Name',
          bio: 'A new bio'
        };

        var url = '/users/' + user.id + '/profile';

        request(token).put(url, update, function(res, body) {
          res.should.have.status(200);
          body.should.have.keys(
            'id', 'name', 'bio', 'email', 'phone'
          );
          done();
        });
      });
    });
  });
});
