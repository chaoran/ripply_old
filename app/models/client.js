var crypto = require('crypto')
  , db = require('../../lib/mysql');

var Client = module.exports = function(body) {
  this.name = body.name;
  this.key = undefined;
  this.secret = undefined;
  this.trusted = false;
};

Client.parse = function(record) {
  record.__proto__ = Client.prototype;
  record.trusted = record.trusted === 1? true : false;
  return record;
}

Client.prototype.save = db.connected(function(conn, callback) {
  this.key = crypto.randomBytes(8).toString('hex');
  this.secret = crypto.randomBytes(24).toString('base64');

  var that = this;

  conn.query('INSERT INTO clients SET ?', this, function(err, result) {
    if (err) return callback(err);
    that.id = result.insertId;
    callback(null, that);
  });
});

Client.prototype.sign = function(req) {
  var schema = 'Basic'
    , credentials = this.key + ':' + this.secret;

  credentials = new Buffer(credentials).toString('base64');
  req.headers.authorization = schema + ' ' + credentials;
};

Client.create = db.connected(function(conn, body, callback) {
  var client = new Client(body);
  client.save(callback);
});

Client.findByKey = db.connected(function(conn, key, callback) {
  conn.query(
    'SELECT * FROM clients WHERE ?', { key: key }, 
    function(err, rows) {
      if (err) return callback(err);
      callback(null, rows.length > 0? Client.parse(rows[0]) : null);
    }
  );
});

