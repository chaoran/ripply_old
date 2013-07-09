var http = require('http')
  , querystring = require('querystring')
  , app = require('../app')
  , config = require('../config/server')[app.settings.env];

var Request = module.exports = function() {
  this.host = 'localhost';
  this.port = config.port;
}

Request.prototype = {
  sign: function(token) {
    var schema, credentials;

    if (token.access_token) {
      schema = 'Bearer';
      credentials = token.access_token;
    } else {
      schema = 'Basic';
      credentials = new Buffer(token.key + ':' + token.secret);
      credentials = credentials.toString('base64');
    }

    this.authorization = schema + ' ' + credentials;
    return this;
  },
  _request: function(method, path, data, callback) {
    var options = {
      host: this.host,
      port: this.port,
      method: method,
      path: path,
      headers: {
        "Accept": 'application/json',
        "Authorization": this.authorization
      }
    };

    if (method == 'POST' || method == 'PUT') {
      options.body = data;
      data = querystring.stringify(data);
      options.headers["Content-Type"] = 'application/x-www-form-urlencoded';
      options.headers["Content-Length"] = data.length;
    }

    delete options.body;

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        callback(res.statusCode, JSON.parse(chunk));
      });
    });

    req.once('error', function(err) {
      throw err;
    });

    if (data) req.write(data);
    req.end();
  },
  get: function(path, callback) {
    this._request('GET', path, null, callback);
  },
  post: function(path, data, callback) {
    this._request('POST', path, data, callback);
  },
  put: function(path, data, callback) {
    this._request('PUT', path, data, callback);
  },
  delete: function(path, callback) {
    this._request('DELETE', path, null, callback);
  }
};

