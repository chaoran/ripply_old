var http = require('http')
  , querystring = require('querystring')
  , app = require('../app')
  , config = require('../config/server')[app.settings.env];

var Request = module.exports = function(token) {
  if (this === global) return new Request(token);

  this.host = 'localhost';
  this.port = config.port;
  this.headers = {
    "Accept": 'application/json'
  };

  if (token) {
    var schema, credentials;

    if (token.access_token) {
      schema = 'Bearer';
      credentials = token.access_token;
    } else {
      schema = 'Basic';
      credentials = new Buffer(token.key + ':' + token.secret);
      credentials = credentials.toString('base64');
    }

    this.headers.authorization = schema + ' ' + credentials;
  }
}

Request.prototype = {
  _request: function(method, path, data, callback) {
    this.method = method;
    this.path = path;
    this.data = data === null? null : querystring.stringify(data);

    if (method == 'POST' || method == 'PUT') {
      this.headers["Content-Type"] = 'application/x-www-form-urlencoded';
      this.headers["Content-Length"] = this.data.length;
    }

    var req = http.request(this, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(body) {
        if (res.headers['content-type'].indexOf('json') >= 0) {
          body = JSON.parse(body);
        }

        callback(res, body);
      });
    });

    req.once('error', function(err) {
      throw err;
    });

    if (this.data) req.write(this.data);
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

