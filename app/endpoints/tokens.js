var express = require('express')
  , auth = require('../middlewares/authenticate')
  , Token = require('../models/token')
  , Session = require('../models/session');

var tokens = module.exports = express();

tokens.use(auth.client);
tokens.use(auth.user);

tokens.post('/', function(req, res, next) {
  if (req.body.grant_type !== 'password') return res.send(400, {
    error: "unsupported_grant_type",
    message: "expects grant_type: 'password'"
  });

  if (req.body.scope) req.body.scope.split('+').forEach(function(permission) {
    switch (permission) {
      case "basic": case "post": case 'up': break;
      default: return res.send(400, { error: 'invalid_scope' });
    }
  });

  Token.create({
    clientId: req.client.id,
    userId: req.user.id,
    permissions: req.body.scope
  }, function(err, token) {
    if (err) return next(err);

    Session.create(token, function(err) {
      if (err) return next(err);

      res.send(200, {
        access_token: token.accessToken,
        expires_in: 3600,
        token_type: 'Bearer',
        scope: token.permissions.split('+'),
        refresh_token: token.refreshToken,
      });
    });
  }); 
});

// refresh an access token
tokens.put('/', function(req, res, next) {
  if (req.body.grant_type !== 'refresh_token') return res.send(400, {
    error: "unsupported_grant_type",
    message: "expects grant_type: 'refresh_token'"
  });

  Token.findByRefreshToken(req.body.refresh_token, function(err, token) {
    if (err) return next(err);
    if (!token || token.clientId !== req.client.id) {
      return res.send(400, { 
        error: "invalid_grant",
        message: "cannot find the specified refresh_token",
      });
    }

    token.refresh(function(err) {
      if (err) return next(err);

      Session.create(token, function(err) {
        if (err) return next(err);

        res.send(200, {
          access_token: token.accessToken,
          expires_in: 3600,
          token_type: 'Bearer',
          scope: token.permissions.split('+'),
          refresh_token: token.refreshToken,
        });
      });
    });
  });
});
