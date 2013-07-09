var querystring = require('querystring')
  , should = require('should')
  , sinon = require('sinon')
  , User = require('../../app/models/user')
  , Token = require('../../app/models/token')
  , Client = require('../../app/models/client')
  , request = require('../../lib/request');

var user, client, token;

before(function(done) {
  user = new User({
    name: 'Test User', 
    email: 'user@test.com', 
    password: 'testme' 
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

describe('When request does not carry an access token', function() {
  describe('GET /users/:id', function() {
    it("should return an error", function(done) {
      request().get('/users/' + user.id, function(code, body) {
        code.should.equal(401, JSON.stringify(body));
        body.should.have.property('error');
        body.error.should.equal('unauthorized');
        done();
      });
    });
  });

  describe('POST /tokens', function() {
    it("should create an access token", function(done) {
      request(client).post('/tokens', {
        email: user.email,
        password: user.password,
        grant_type: 'password',
        scope: 'basic+post'
      }, function(code, body) {
        code.should.equal(200, JSON.stringify(body));
        body.should.not.have.property('error');
        body.should.have.property('access_token');
        body.access_token.should.have.length(24);
        body.should.have.property('expires_in');
        body.expires_in.should.equal(3600);
        body.should.have.property('token_type');
        body.token_type.should.equal('Bearer');
        body.should.have.property('scope');
        body.scope.should.eql(['basic', 'post']);
        body.should.have.property('refresh_token');
        body.access_token.should.have.length(24);

        token = body;

        done();
      });
    });
  });
});

describe('When request carries a valid access token', function() {
  describe('GET /users/:user_id', function() {
    it("should return user profile", function(done) {
      request(token).get('/users/' + user.id, function(code, body) {
        code.should.equal(200, JSON.stringify(body));
        body.should.have.property('name');
        body.name.should.equal(user.name);
        body.should.have.property('email');
        body.email.should.equal(user.email);
        body.should.not.have.property('password');
        body.should.not.have.property('password_hash');
        body.should.not.have.property('password_salt');
        done();
      });
    });
  });

  describe('After access token expires', function() {
    before(function() {
      var security = require('../../config').security;

      this.clock = sinon.useFakeTimers(Date.now());
      this.clock.tick(security.accessTokenLive * 1000);
    });

    describe('GET /users/:id', function() {
      it("should return an error", function(done) {
        request(token).get('/users/' + user.id, function(code, body) {
          code.should.equal(401, JSON.stringify(body));
          body.should.have.property('error');
          body.error.should.equal('unauthorized');
          body.should.have.property('error_description');
          body.error_description.should.include('expired');
          done();
        });
      });
    });

    describe("PUT /tokens?refresh_token=[refresh_token]", function() {
      it('should refresh an access token', function(done) {
        var url = '/tokens' + '?' + querystring.stringify({
          refresh_token: token.refresh_token
        });

        request(client).put(url, {
          email: user.email,
          password: user.password,
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token
        }, function(code, body) {
          code.should.equal(200, JSON.stringify(body));
          body.should.not.have.property('error');
          body.should.have.property('access_token');
          body.access_token.should.have.length(24);
          body.access_token.should.not.equal(token.access_token);
          body.should.have.property('expires_in');
          body.expires_in.should.equal(3600);
          body.should.have.property('token_type');
          body.token_type.should.equal('Bearer');
          body.should.have.property('scope');
          body.scope.should.eql(['basic', 'post']);
          body.should.have.property('refresh_token');
          body.access_token.should.have.length(24);
          body.refresh_token.should.not.equal(token.refresh_token);

          token = body;

          done();
        });
      });
    });

    describe('GET /users/:user_id', function() {
      it("should return user profile", function(done) {
        request(token).get('/users/' + user.id, function(code, body) {
          code.should.equal(200, JSON.stringify(body));
          body.should.have.property('name');
          body.name.should.equal(user.name);
          body.should.have.property('email');
          body.email.should.equal(user.email);
          body.should.not.have.property('password');
          body.should.not.have.property('password_hash');
          body.should.not.have.property('password_salt');
          done();
        });
      });
    });

    after(function() {
      this.clock.restore();
    });
  });
});


