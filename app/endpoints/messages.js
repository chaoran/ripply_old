var express = require('express')
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized')
  , Message = require('../models/message')
  , Up = require('../models/up')
  , messages = express();

messages.use(auth.token);

messages.get('/', function(req, res, next) {
  var from = req.query.from || '+inf'
    , to = req.query.to || 0;

  if ((typeof from !== 'number') && from !== '+inf') return res.send(400, {
    error: 'invalid_query',
    message: "query field 'from' should be a number or string '+inf'",
    value: from
  });

  if (typeof to !== 'number') return res.send(400, {
    error: 'invalid_query',
    message: "query field 'to' should be a number"
  });

  req.session.mailbox.read(from, to, function(err, ids, scores) {
    if (err) return next(err);
    if (ids.length === 0) return res.json(ids);

    Message.findAll(ids, function(err, messages) {
      if (err) return next(err);

      messages.forEach(function(message, idx) {
        message.timestamp = scores[idx];
      });

      res.send(200, messages);
    });
  });
});

messages.post('/', authorized.post, function(req, res, next) {
  var message = new Message(req.body);

  message.userId = req.session.token.userId;
  message.save(function(err, message, up) {
    if (err) return next(err);

    req.session.mailbox.write(message.id, up.id, function(err) {
      if (err) return next(err);

      res.location(message.id.toString());
      res.send(201, message);
    });
  });
});

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

messages.put('/:id', authorized.up, function(req, res, next) {
  var up = new Up({
    messageId: req.message.id,
    userId: req.session.token.userId
  });

  if (req.message.userId === up.userId) return res.send(403, {
    error: 'forbidden',
    message: "cannot up one's own message",
  });

  up.save(function(err, up) {
    if (err && err.code !== 'ER_DUP_ENTRY') return next(err);
    res.send(200);
  });
});

messages.get('/:id', function(req, res, next) {
  res.send(req.message);
});

messages.del('/:id', function(req, res, next) {
  var message = req.message;

  if (message.userId === req.session.token.userId) {
    req.message.destroy(function(err) {
      if (err) return next(err);
      res.send(200);
    });
  } else {
    next(new Error('not implemented'));
  }
});

module.exports = messages;
