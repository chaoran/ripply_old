var express = require('express')
  , ep = express()
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized')
  , Message = require('../models/message');

ep.post('/', auth.token, authorized.post, function(req, res, next) {
  var message = new Message(req.body);
  message.userId = req.token.userId;
  message.save(function(err, message) {
    if (err) return next(err);
    res.location(message.id.toString());
    res.send(201, message);
  });
});

module.exports = ep;
