var User = require('../models/user')
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized');

var express = require('express')
  , ep = express();

ep.param('id', function(req, res, next, id) {
  User.find(id, function(err, user) {
    if (err) {
      next(err);
    } else if (!user) {
      res.send(404, {
        error: "resource_not_found",
        message: "cannot find user with specified id",
        value: id
      });
    } else {
      req.user = user; 
      next();
    }
  });
});

ep.post('/users', auth.client, authorized.register, function(req, res, next) {
  User.create(req.body, function(err, user) {
    if (err) return next(err);

    res.location('/users/' + user.id);
    res.send(201, {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
    });
  });
});

// get a user resource
ep.get('/users/:id', auth.token, function(req, res, next) {
  var user = req.user;

  res.send(200, {
    id: user.id,
    username: user.username,
    name: user.name,
    bio: user.bio,
  });
});

// update user profile (name, bio, email, phone)
ep.put('/users/:id/profile', auth.token, function(req, res, next) {
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
