var express = require('express')
  , ep = express()
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized')
  , User = require('../models/user');

ep.param('id', function(req, res, next, id) {
  User.find(id, function(err, user) {
    if (err) {
      next(err);
    } else if (!user) {
      res.send(404, {
        error: "invalid_resource_id",
        message: "cannot find user with specified id",
        value: id
      });
    } else {
      req.user = user; 
      next();
    }
  });
});

ep.post('/', auth.client, authorized.register, function(req, res, next) {
  User.create(req.body, function(err, user) {
    if (err) return next(err);

    res.location(user.id.toString());
    res.send(201, {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      createdAt: user.createdAt
    });
  });
});

// get a user 
ep.get('/:id', auth.token, function(req, res, next) {
  var user = req.user;

  res.send(200, {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
    createdAt: user.createdAt
  });
});

// update user profile (name, bio, email, phone)
ep.put('/:id/profile', auth.token, function(req, res, next) {
  req.user.update(req.body, function(err, user) {
    if (err) return next(err);

    res.send(200, {
      id: user.id,
      name: user.name,
      bio: user.bio,
      email: user.email,
      phone: user.phone,
    });
  });
});

module.exports = ep;
