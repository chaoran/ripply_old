var should = require('should')
  , request = require('../../lib/request')
  , User = require('../../app/models/user')
  , Client = require('../../app/models/client');

var message = {
  body: "This is a new message!",
};

var user, client, token;

before(function() {
  require('../../bin/server');
});

before(function(done) {
  user = new User({
    username: 'testmessage',
    password: 'message',
  })
  user.save(done)
});

before(function(done) {
  client = new Client({
    name: 'testmessageclient'
  });
  client.save(done);
});

describe('Messages:', function() {
  describe('without post permission', function() {
    before(function(done) {
      request(client).post('/tokens', {
        grant_type: 'password',
        username: user.username,
        password: user.password,
      }, function(res, body) {
        res.should.have.status(200);
        token = body;
        done();
      });
    });

    describe('POST /messages', function() {
      it('should return an error', function(done) {
        request(token).post('/messages', message, function(res, body) {
          res.should.have.status(401);
          body.should.have.keys('error', 'message');
          body.error.should.equal('invalid_scope');
          done();
        });
      });
    });
  });
  describe('with post permission', function() {
    before(function(done) {
      request(client).post('/tokens', {
        grant_type: 'password',
        username: user.username,
        password: user.password,
        scope: 'basic+post',
      }, function(res, body) {
        res.should.have.status(200);
        token = body;
        done();
      });
    });

    describe('POST /messages', function() {
      it('should post a message successfully', function(done) {
        request(token).post('/messages', message, function(res, body) {
          res.should.have.status(201);
          body.should.have.keys('id', 'body', 'userId', 'createdAt');
          res.should.have.header('location', '/messages/' + body.id);
          body.body.should.equal(message.body);
          body.userId.should.equal(user.id);
          message = body;
          done();
        });
      });
    });
  });
  describe('after posting a message', function() {
    describe('GET /messages/:id', function() {
      it('should return the posted message', function(done) {
        request(token).get('/messages/' + message.id, function(res, body) {
          res.should.have.status(200);
          body.should.eql(message);
          done();
        });
      });
    });
  });
});
