var fs = require('fs')
  , redis = require('./redis')
  , config = require('../config').mailbox
  , batch = config.batch
  , ttl = config.ttl
  , dirname = config.dirname;

var Mailbox = module.exports = function(body) {
  this.key = '@' + (body.userId || body.id);
};

Mailbox.prototype = {
  persist: function(callback) {
    var key = this.key;

    redis.dump(key, function(err, data) {
      fs.writeFile(dirname + '/' + key, callback);
    });
  },
  restore: function(callback) {
    var key = this.key

    fs.readFile(dirname + '/' + key, function(err, data) {
      if (!data) return callback(null);
      redis.restore(key, ttl, data, callback);
    });
  },
  write: function(id, score, callback) {
    redis.zadd(this.key, score, id, callback);
  },
  read: function(from, to, callback) {
    redis.zrevrangebyscore(
      this.key, from, to, 'WITHSCORES', 'LIMIT', 0, batch, 
      function(err, results) {
        var length = results.length / 2
          , ids = new Array(length)
          , scores = new Array(length)
          , i = 0;

        while (i < length) {
          ids[i] = results.shift();
          scores[i] = results.shift();
          ++i;
        }

        callback(null, ids, scores);
      }
    );
  },
};

