var express = require('express')
  , ep = express()
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized')
  , Message = require('../models/message');

ep.param('message', function(req, res, next, id) {
  Message.find(id, function(err, message) {
    if (err) return next(err);
    if (!message) return res.send(404, {
      error: 'invalid_resource_id',
      message: 'cannot find message with specified id',
      value: id,
    });

    req.message = message;
    next();
  });
});

ep.post('/', auth.token, authorized.post, function(req, res, next) {
  var message = new Message(req.body);
  message.userId = req.token.userId;
  message.save(function(err, message) {
    if (err) return next(err);
    res.location(message.id.toString());
    res.send(201, message);
  });
});

ep.get('/:message', function(req, res, next) {
  res.send(req.message);
});

module.exports = ep;
