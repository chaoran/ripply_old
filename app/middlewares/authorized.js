var Token = require('../models/token');

module.exports = {
  post: function(req, res, next) {
    if (req.token.permissions.indexOf('post') >= 0) next();
    else res.send(401, { 
      error: "invalid_scope", 
      message: "access token lacks proper scope"
    });
  },
  up: function(req, res, next) {
    if (req.session.permissions.indexOf('up') >= 0) next();
    else res.send(400, {
      error: "invalid_scope",
      message: "access token do not have 'up' permission"
    });
  },
  register: function(req, res, next) {
    if (req.client.trusted === true) next();
    else res.send(403, { 
      error: "forbidden", 
      message: "url is reserved for internal use"
    });
  }
};
