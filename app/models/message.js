var db = require('../../lib/mysql');

var Message = module.exports = function(body) {
  this.userId = body.userId;
  this.body = body.body;
};

Message.find = db.connected(function(conn, id, callback) {
  conn.query("SELECT * FROM messages WHERE id=?", [ id ], function(err, rows) {
    if (err) return callback(err);
    callback(null, rows.length > 0? Message.parse(rows[0]) : null);
  });
});

Message.create = function(body, callback) {
  var message = new Message(body);
  message.save(callback);
};

Message.parse = function(record) {
  record.__proto__ = Message.prototype;
  return record;
};

Message.prototype = {
  save: db.connected(function(conn, callback) {
    var that = this;

    this.createdAt = new Date();
    this.createdAt.setMilliseconds(0);

    conn.query("INSERT INTO messages SET ?", this, function(err, result) {
      if (err) return callback(err);
      that.id = result.insertId;
      callback(null, that);
    });
  }),
};

