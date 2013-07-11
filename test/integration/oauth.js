var querystring = require('querystring')
  , should = require('should')
  , sinon = require('sinon')
  , User = require('../../app/models/user')
  , Token = require('../../app/models/token')
  , Client = require('../../app/models/client')
  , request = require('../../lib/request');

describe('OAuth:', function() {
  var user, client, token;

  before(function(done) {
    user = new User({
      username: 'oauthuser', 
      password: 'testme',
      name: 'Test User', 
      bio: 'happy new year'
    });
    user.save(function(err, _user) {
      if (err) return done(err);
      done();
    })
  });

  before(function(done) {
    client = new Client({ name: "test client" });
    client.save(function(err, client) {
      if (err) return done(err);
      done();
    });
  });

  before(function() {
    require('../../bin/server');
  });

  describe('when request does not carry an access token', function() {
    describe('GET /users/:id', function() {
      it("should return an error", function(done) {
        request().get('/users/' + user.id, function(res, body) {
          res.should.have.status(401);
          body.should.have.keys('error', 'message');
          body.error.should.equal('unauthorized');
          done();
        });
      });
    });

    describe('POST /tokens', function() {
      it("should create an access token", function(done) {
        request(client).post('/tokens', {
          username: user.username,
          password: user.password,
          grant_type: 'password',
          scope: 'basic+post'
        }, function(res, body) {
          res.should.have.status(200);
          body.should.have.keys(
            'access_token', 'expires_in', 'token_type', 'scope', 'refresh_token'
          );
          body.access_token.should.have.length(24);
          body.expires_in.should.equal(3600);
          body.token_type.should.equal('Bearer');
          body.scope.should.eql(['basic', 'post']);
          body.access_token.should.have.length(24);

          token = body;

          done();
        });
      });
    });
  });

  describe('when request carries a valid access token', function() {
    describe('GET /users/:user_id', function() {
      it("should return user profile", function(done) {
        request(token).get('/users/' + user.id, function(res, body) {
          res.should.have.status(200);
          body.should.have.keys('id', 'name', 'username', 'bio');
          body.id.should.equal(user.id);
          body.name.should.equal(user.name);
          body.username.should.equal(user.username);
          body.bio.should.equal(user.bio);
          done();
        });
      });
    });

  });
  describe('after access token expires', function() {
    before(function() {
      var security = require('../../config').security;

      this.clock = sinon.useFakeTimers(Date.now());
      this.clock.tick(security.accessTokenLive * 1000);
    });

    describe('GET /users/:id', function() {
      it("should return an error", function(done) {
        request(token).get('/users/' + user.id, function(res, body) {
          res.should.have.status(401);
          body.should.have.keys('error', 'message');
          body.error.should.equal('unauthorized');
          body.message.should.include('expired');
          done();
        });
      });
    });


    after(function() {
      this.clock.restore();
    });
  });

  describe('to request a new access token', function() {
    describe("PUT /tokens", function() {
      it('should refresh an access token', function(done) {
        request(client).put('/tokens', {
          username: user.username,
          password: user.password,
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token
        }, function(res, body) {
          res.should.have.status(200);
          body.should.have.keys(
            'access_token', 'expires_in', 'token_type', 'scope', 
            'refresh_token'
          );
          body.access_token.should.have.length(24);
          body.expires_in.should.equal(3600);
          body.token_type.should.equal('Bearer');
          body.scope.should.eql(['basic', 'post']);
          body.refresh_token.should.have.length(24);
          body.access_token.should.not.equal(token.access_token);
          body.refresh_token.should.not.equal(token.refresh_token);

          token = body;

          done();
        });
      });
    });
  });

  describe('after refresh access token', function() {
    describe('GET /users/:user_id', function() {
      it("should return user profile", function(done) {
        request(token).get('/users/' + user.id, function(res, body) {
          res.should.have.status(200);
          body.should.have.keys('id', 'name', 'username', 'bio');
          body.id.should.equal(user.id);
          body.username.should.equal(user.username);
          body.name.should.equal(user.name);
          body.bio.should.equal(user.bio);
          done();
        });
      });
    });
  });
});

