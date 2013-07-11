var db = require('../../lib/mysql');

var Up = module.exports = function(body) {
  this.messageId = body.messageId;
  this.userId = body.userId;

  this.createdAt = new Date();
  this.createdAt.setMilliseconds(0);
};

Up.prototype = {
  save: db.connected(function(conn, callback) {
    var that = this;

    conn.query('INSERT INTO ups SET ?', this, function(err, result) {
      if (err) return callback(err);

      that.id = result.insertId;
      callback(null, that);
    });
  }),
};
