var User = require('../models/user')
  , Client = require('../models/client');

module.exports = {
  user: function(req, res, next) {
    var email = req.body.email
      , password = req.body.password;

    User.findByEmail(email, function(err, user) {
      if (err) return next(err);
      if (!user) return res.send(401, {
        error: "invalid_credentials",
        error_description: "invalid user email/password"
      });

      user.authenticate(password, function(err, authenticated) {
        if (!authenticated) return res.send(401, {
          error: "invalid_credentials",
          error_description: "invalid user email/password"
        });

        req.user = user;
        next();
      });
    });
  },
  client: function(req, res, next) {
    var authorization = req.headers.authorization
      , parts = authorization.split(' ')
      , schema = parts[0];

    if (parts.length !== 2 || schema !== 'Basic') return res.send(400, { 
      error: "invalid_request",
      error: "invalid authorization header"
    });

    var credentials = new Buffer(parts[1], 'base64').toString().split(':')
      , key = credentials[0]
      , secret = credentials[1];

    if (!key || !secret) return res.send(400, { 
      error: "invalid_request",
      error_description: "invalid client credentials"
    });

    Client.findByKey(key, function(err, client) {
      if (err) return next(err);
      if (!client || client.secret !== secret) return res.send(401, {
        error: "invalid_client",
        error_description: "wrong client credentials"
      });

      req.client = client;
      next();
    });
  }
};
