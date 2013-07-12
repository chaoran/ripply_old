var finish = require('finish')
  , redis = require('./redis')
  , config = require('../config/mailbox')
  , Mailbox = require('./mailbox')
  , ttl = config.ttl;

var Session = module.exports = function(token) {
  for (var key in token) {
    if (token.hasOwnProperty(key)) this[key] = token[key];
  }
};

Session.find = function(key, callback) {
  redis.get(key, function(err, session) {
    if (err) return callback(err);
    
    callback(null, session ? Session.parse(session) : null);
  });
};

Session.parse = function(session) {
  session = JSON.parse(session);
  session.__proto__ = Session.prototype;
  return session;
};

Session.prototype = {
  save: function(callback) {
    var key = this.accessToken
      , data = JSON.stringify(this)
      , mailbox = this.mailbox;

    finish(function(async) {
      async(function(done) {
        redis.set(key, data, 'PX', ttl, done);
      });
      async(function(done) {
        mailbox.restore(done);
      });
    }, callback);
  },
};

Object.defineProperty(Session.prototype, 'mailbox', {
  get: function() {
    delete this.mailbox;
    return this.mailbox = new Mailbox(this);
  },
  configurable: true
});
