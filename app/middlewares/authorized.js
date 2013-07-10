var Token = require('../models/token');

module.exports = {
  post: function(req, res, next) {
    if (req.token.permissions.indexOf('post') >= 0) next();
    else res.send(401, { error: "lack_permission", });
  },
  register: function(req, res, next) {
    if (req.client.trusted === true) next();
    else res.send(403, { 
      error: "forbidden_request", 
      message: "method is reserved for internal use"
    });
  }
};
