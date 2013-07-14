var fs = require('fs')
  , redis = require('../../lib/redis')
  , config = require('../../config').mailbox
  , batch = config.batch
  , dirname = config.dirname;

var Mailbox = module.exports = function(userId) {
  this.key = '@' + userId;
};

Mailbox.find = function(userId, callback) {
  return new Mailbox(userId);
};

Mailbox.prototype = {
  offline: function(callback) {
    var key = this.key;

    redis.dump(key, function(err, data) {
      if (err) return callback(err);
      if (!data) return callback(null);

      fs.writeFile(dirname + '/' + key, data, callback);
    });
  },
  online: function(callback) {
    var key = this.key

    fs.readFile(dirname + '/' + key, {
      encoding: 'utf8'
    }, function(err, data) {
      if (err && err.code !== 'ENOENT') return callback(err);
      if (!data) return callback(null);

      redis.restore(key, config.ttl, data, callback);
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

