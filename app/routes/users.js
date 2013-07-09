var User = require('../models/user')
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized');

module.exports = function(app) {
  // register a user
  //app.post('/users', auth.client, authorized.super, function(req, res, next) {
    //User.create(req.body, function(err, user) {
      //if (err) return next(err);

      //delete user.passwordHash;
      //delete user.passwordSalt;

      //res.location('users/' + user.id);
      //res.send(201, user);
    //});
  //});

  // get a user's info
  app.get('/users/:id', authorized.read, function(req, res, next) {
    User.find(req.params.id, function(err, user) {
      if (err) return next(err);
      if (!user) return res.send(404, {
        message: "cannot find user with id: " + req.params.id
      });

      delete user.passwordHash;
      delete user.passwordSalt;

      res.send(200, user);
    });
  });
};
