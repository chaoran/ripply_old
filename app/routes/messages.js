var express = require('express')
  , messages = express()
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized')
  , Message = require('../models/message')
  , Up = require('../models/up');

messages.use(auth.token);

messages.param('id', function(req, res, next, id) {
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

messages.post('/', authorized.post, function(req, res, next) {
  var message = new Message(req.body);
  message.userId = req.token.userId;
  message.save(function(err, message) {
    if (err) return next(err);
    res.location(message.id.toString());
    res.send(201, message);
  });
});

messages.get('/:id', function(req, res, next) {
  res.send(req.message);
});

messages.put('/:id', function(req, res, next) {
  var up = new Up({
    messageId: req.message.id,
    userId: req.token.userId
  });

  if (req.message.userId === up.userId) return res.send(403, {
    error: 'forbidden',
    message: "cannot up one's own message",
  });

  up.save(function(err, up) {
    if (err) return next(err);
    res.send(up);
  });
});

module.exports = messages;
