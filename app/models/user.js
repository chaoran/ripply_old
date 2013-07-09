var bcrypt = require('bcrypt')
  , db = require('../../lib/mysql');

var User = module.exports = function(body) {
  this.email = body.email;
  this.name = body.name;

  // virtual property
  Object.defineProperty(this, 'password', {
    value: body.password
  });
};

User.parse = function(record) {
  record.__proto__ = User.prototype;
  return record;
};

User.create = db.connected(function(conn, body, callback) {
  var user = new User(body);
  user.save(callback);
});

User.find = db.connected(function(conn, id, callback) {
  conn.query("SELECT * FROM users WHERE ?", { id: id }, function(err, rows) {
    if (err) return callback(err);
    callback(null, rows.length > 0? User.parse(rows[0]) : null);
  });
});

User.findByEmail = db.connected(function(conn, email, callback) {
  conn.query(
    "SELECT * FROM users WHERE ?", { email: email }, function(err, rows) {
    if (err) return callback(err);
    callback(null, rows.length > 0? User.parse(rows[0]) : null);
  });
});

User.prototype = {
  save: db.connected(function(conn, callback) {
    var that = this;

    if (!this.passwordHash) return this.encryptPassword(function(err) {
      if (err) return callback(err);
      that.save(callback);
    });

    conn.query("INSERT INTO users SET ?", this, function(err, result) {
      if (err) return callback(err);
      that.id = result.insertId;
      callback(null, that);
    });
  }),
  encryptPassword: function(callback) {
    var that = this;
    bcrypt.genSalt(this.config.bcryptStrength, function(err, salt) {
      if (err) return callback(err);
      that.passwordSalt = salt;
      bcrypt.hash(that.password, salt, function(err, hash) {
        if (err) return callback(err);
        that.passwordHash = hash;
        callback(null, that);
      });
    });
  },
  authenticate: function(password, callback) {
    if (!password) return callback(null, false);
    bcrypt.compare(password, this.passwordHash, callback);
  },
};

Object.defineProperty(User.prototype, 'config', {
  value: require('../../config/security')[require('..').settings.env]
});
