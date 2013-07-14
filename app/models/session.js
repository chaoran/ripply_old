var finish = require('finish')
  , redis = require('../../lib/redis')
  , Mailbox = require('./mailbox')
  , Token = require('./token')
  , config = require('../../config').session
  , live = config.live;

var sessions = {};

var Session = module.exports = function(token) {
  this.token = token;
  this.mailbox = Mailbox.find(token.userId);
};

Session.find = function(key, callback) {
  var session = sessions[key];

  if (session) return session.validate(callback);

  Token.findByAccessToken(key, function(err, token) {
    if (err) return callback(err);
    if (!token || token.expired) return callback(null, null);

    Session.create(token, callback);
  });
};

Session.create = function(token, callback) {
  var session = new Session(token);
  session.save(callback);
};

Session.prototype = {
  validate: function(callback) {
    if (!this.token.expired) return callback(null, this);

    delete sessions[this.token.accessToken];
    this.mailbox.offline(callback);
  },
  save: function(callback) {
    var that = this;

    sessions[this.token.accessToken] = this;
    this.mailbox.online(function(err) {
      if (err) return callback(err);
      callback(null, that);
    });
  }
};

setInterval(function() {
  for (var key in sessions) session[key].validate();
}, live);

