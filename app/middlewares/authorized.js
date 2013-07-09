var Token = require('../models/token');

module.exports = {
  read: function(req, res, next) {
    var authorization = req.headers.authorization
      , parts = authorization.split(' ')
      , schema = parts[0]
      , token = parts[1];

    if (schema !== 'Bearer' || !token) return res.send(400, {
      error: "invalid_request",
      error_description: "missing or malformed authorization header"
    });

    Token.findByAccessToken(token, function(err, auth) {
      if (err) return next(err);
      if (!auth) return res.send(401, { 
        error: "invalid_access_token",
      });

      req.token = token;
      next();
    });
  },
  write: function(req, res, next) {
    this.basic(req, res, function(err) {
      if (err) return next(err);

      if (req.token.permissions.indexOf('post') >= 0) next();
      else res.send(401, { error: "do_not_have_permission", });
    });
  },
  register: function(req, res, next) {
    if (req.client.trusted === true) next();
    else res.send(400, { error: "do_not_have_permission", });
  }
};
