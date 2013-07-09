var auth = require('../middlewares/authenticate')
  , Token = require('../models/token');

module.exports = function(app) {
  // create an access token
  app.post('/tokens', auth.client, auth.user, function(req, res, next) {
    if (req.body.grant_type !== 'password') return res.send(400, {
      error: "unsupported_grant_type",
      error_descriptiont: "expects grant_type: 'password'"
    });

    if (req.body.scope) req.body.scope.split('+').forEach(function(permission) {
      switch (permission) {
        case "read": case "write": break;
        default: return res.send(400, { error: 'invalid_scope' });
      }
    });

    Token.create({
      clientId: req.client.id,
      userId: req.user.id,
      permissions: req.body.scope
    }, function(err, token) {
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

  // refresh an access token
  app.put('/tokens', auth.client, auth.user, function(req, res, next) {
    if (req.body.grant_type !== 'refresh_token') return res.send(400, {
      error: "unsupported_grant_type",
      error_description: "expects grant_type: 'refresh_token'"
    });

    Token.findByRefreshToken(req.query.refresh_token, function(err, token) {
      if (err) return next(err);
      if (!token || token.clientId !== req.client.id) {
        return res.send(400, { 
          error: "invalid_grant",
          error_description: "cannot find the specified refresh_token",
        });
      }

      token.refresh(function(err) {
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
};
