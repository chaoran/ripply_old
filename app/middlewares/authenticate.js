var User = require('../models/user')
  , Token = require('../models/token')
  , Client = require('../models/client')
  , Session = require('../models/session');

module.exports = {
  token: function(req, res, next) {
    var authorization = req.headers.authorization || ''
      , parts = authorization.split(' ')
      , schema = parts[0]
      , accessToken = parts[1];

    if (!authorization || schema !== 'Bearer' || !accessToken) {
      return res.send(401, {
        error: "unauthorized",
        message: "missing or malformed authorization header"
      });
    }

    Session.find(accessToken, function(err, session) {
      if (err) return next(err);

      if (!session) return res.send(401, { 
        error: "unauthorized",
        message: "access token is invalid or expired"
      });

      req.session = session;
      next();
    });
  },
  user: function(req, res, next) {
    var username = req.body.username
      , password = req.body.password;

    User.findByUsername(username, function(err, user) {
      if (err) return next(err);
      if (!user) return res.send(401, {
        error: "invalid_credentials",
        message: "invalid user username/password"
      });

      user.authenticate(password, function(err, authenticated) {
        if (!authenticated) return res.send(401, {
          error: "invalid_credentials",
          message: "invalid user email/password"
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
      message: "invalid authorization header"
    });

    var credentials = new Buffer(parts[1], 'base64').toString().split(':')
      , key = credentials[0]
      , secret = credentials[1];

    if (!key || !secret) return res.send(400, { 
      error: "invalid_request",
      message: "invalid client credentials"
    });

    Client.findByKey(key, function(err, client) {
      if (err) return next(err);
      if (!client || client.secret !== secret) return res.send(401, {
        error: "invalid_client",
        message: "wrong client credentials"
      });

      req.client = client;
      next();
    });
  }
};
