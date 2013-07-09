var should = require('should')
  , querystring = require('querystring')
  , User = require('../../app/models/user')
  , Token = require('../../app/models/token')
  , Client = require('../../app/models/client')
  , Request = require('../../lib/request');

var request = new Request();
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
  client = new Client({ name: "official" });
  client.save(function(err, client) {
    if (err) return done(err);
    official = client;
    done();
  });
});

before(function() {
  require('../../bin/server');
});

describe('POST /tokens', function() {
  it("should create an access token", function(done) {
    request.sign(official).post('/tokens', {
      email: user.email,
      password: user.password,
      grant_type: 'password',
      scope: 'read+write'
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
      body.scope.should.eql(['read', 'write']);
      body.should.have.property('refresh_token');
      body.access_token.should.have.length(24);

      token = body;

      done();
    });
  });
});

describe("PUT /tokens?refresh_token=[refresh_token]", function() {
  it('should refresh an access token', function(done) {
    var url = '/tokens' + '?' + querystring.stringify({
      refresh_token: token.refresh_token
    });

    request.sign(official).put(url, {
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
      body.scope.should.eql(['read', 'write']);
      body.should.have.property('refresh_token');
      body.access_token.should.have.length(24);
      body.refresh_token.should.not.equal(token.refresh_token);

      token = body;

      done();
    });
  });
});

describe('GET /users/:id', function() {
  it("should return a user's profile successfully", function(done) {
    request.sign(token).get('/users/' + user.id, function(code, body) {
      code.should.equal(200, JSON.stringify(body));
      body.should.have.property('id');
      body.id.should.equal(user.id);
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
