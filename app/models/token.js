var crypto = require('crypto')
  , db = require('../../lib/mysql');

var Token = module.exports = function(body) {
  this.clientId = body.clientId;
  this.userId = body.userId;
  this.permissions = body.permissions || 'basic';

  this.accessToken = generateToken();
  this.refreshToken = generateToken();
  this.created_at = this.updated_at = new Date();
};

function generateToken() {
  return crypto.randomBytes(18).toString('base64');
}

Token.prototype = {
  save: db.connected(function(conn, callback) {
    var that = this;

    conn.query('INSERT INTO tokens SET ?', this,
      function(err, result) {
        if (err) return callback(err);

        that.id = result.insertId;
        callback(null, that);
      }
    );
  }),
  expire: db.connected(function(conn, callback) {
    this.expired = true;

    conn.query(
      'UPDATE tokens SET ? WHERE ?', 
      [
        { expired: this.expired }, 
        { id: this.id }
      ], 
      callback
    );
  }),
  refresh: db.connected(function(conn, callback) {
    this.refreshToken = generateToken();
    this.accessToken = generateToken();
    this.updated_at = new Date();
    this.expired = false;

    conn.query(
      'UPDATE tokens SET ? WHERE ?', 
      [
        { refreshToken: this.refreshToken, accessToken: this.accessToken,
          expired: false, updated_at: this.updated_at }, 
        { id: this.id }
      ], 
      callback);
  })
}

Token.parse = function(record) {
  record.__proto__ = Token.prototype;
  return record;
};

Token.create = function(body, callback) {
  var token = new Token(body);
  token.save(callback);
};

//Token.find = db.connected(function(conn, id, callback) {
//conn.query('SELECT * FROM tokens WHERE ?', { id: id }, function(err, rows) {
//if (err) return callback(err);
//else callback(null, Token.parse(rows[0]));
//});
//});

Token.findByRefreshToken = db.connected(function(conn, refreshToken, callback) {
  conn.query(
    'SELECT * FROM tokens WHERE ?', { refreshToken: refreshToken },
    function(err, rows) {
      if (err) return callback(err);
      else callback(null, rows.length > 0? Token.parse(rows[0]) : null);
    }
  );
});

Token.findByAccessToken = db.connected(function(conn, accessToken, callback) {
  conn.query(
    'SELECT * FROM tokens WHERE ?', { accessToken: accessToken },
    function(err, rows) {
      if (err) return callback(err);
      else callback(null, rows.length > 0? Token.parse(rows[0]) : null);
    }
  );
});
