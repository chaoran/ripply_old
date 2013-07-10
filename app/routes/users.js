var User = require('../models/user')
  , auth = require('../middlewares/authenticate')
  , authorized = require('../middlewares/authorized');

module.exports = function(app) {
  // register a user
  app.post(
    '/users', auth.client, authorized.register, 
    function(req, res, next) {
      User.create(req.body, function(err, user) {
        if (err) return next(err);

        delete user.passwordHash;
        delete user.passwordSalt;

        res.location('users/' + user.id);
        res.send(201, {
          id: user.id,
          name: user.name,
          username: user.username,
          bio: user.bio
        });
      });
    }
  );

  // get a user's info
  app.get('/users/:id', auth.token, function(req, res, next) {
    User.find(req.params.id, function(err, user) {
      if (err) return next(err);
      if (!user) return res.send(404, {
        message: "cannot find user with id: " + req.params.id
      });

      delete user.passwordHash;
      delete user.passwordSalt;

      res.send(200, {
        id: user.id,
        name: user.name,
        username: user.username,
        bio: user.bio
      });
    });
  });
};
