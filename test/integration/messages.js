var should = require('should')
  , request = require('../../lib/request')
  , User = require('../../app/models/user')
  , Token = require('../../app/models/token')
  , Client = require('../../app/models/client');

var message = {
  body: "This is a new message!",
};

var user, client;

before(function() {
  require('../../bin/server');
});

before(function(done) {
  user = new User({
    username: 'testmessage',
    password: 'message',
  });
  user.save(done)
});

before(function(done) {
  client = new Client({
    name: 'testmessageclient'
  });
  client.save(done);
});

describe('Messages:', function() {
  var token;

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

    describe('when try to up my own message', function() {
      describe('PUT /messages/:id', function() {
        it('should return forbidden error', function(done) {
          request(token).put('/messages/' + message.id, function(res, body) {
            res.should.have.status(403);
            body.should.have.keys('error', 'message');
            done();
          });
        });
      });
    });
  });

  describe('another user', function() {
    var read, up;

    before(function(done) {
      var user = new User({
        username: 'messagereader',
        password: 'message1',
      });

      user.save(function(err, user) {
        read = new Token({
          clientId: client.id,
          userId: user.id,
        });
        read.save(done);
      });
    });

    describe('GET /messages/:id', function() {
      it('should return the posted message', function(done) {
        request(read).get('/messages/' + message.id, function(res, body) {
          res.should.have.status(200);
          body.should.eql(message);
          done();
        });
      });
    });
    describe('PUT /messages/:id', function() {
      it('should up the message', function(done) {
        request(read).put('/messages/' + message.id, function(res, body) {
          res.should.have.status(200);
          done();
        });
      });
    });
    describe('PUT /messages/:id', function() {
      it("should silently ignore the up", function(done) {
        request(read).put('/messages/' + message.id, function(res, body) {
          res.should.have.status(200);
          done();
        });
      });
    });
  });

  describe('DELETE /messages/:id', function() {
    it('should destroy the message', function(done) {
      request(token).del('/messages/' + message.id, function(res, body) {
        res.should.have.status(200);
        done();
      });
    });
  });
});
