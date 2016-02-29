var express = require('express'),
    auth = express.Router(),
    jwt = require('jsonwebtoken');

module.exports = function(models, config, utils) {
  var User = models.User;
  
  var authenticate = function(req, res) {
    var error = {
      authenticated: false,
      token: null,
      user: null,
      error: 'Failed to login. Email or password may be incorrect.'
    };
    if (!req.body.email || !req.body.password) {
      return res.json(400, error);
    }
    User
      .find({
        where: {
          email: req.body.email
        }
      })
      .then(function(user) {
        user.authenticate(
          req.body.password,
          function(err, authenticated) {
            if (err || !authenticated)
              return res.json(400, error);
            var userJSON = user.toJSON();
            user
              .isOrganizationAdmin()
              .then(function(isAdmin) {
                userJSON.isOrganizationAdmin = isAdmin;
                return res.json(200, {
                  authenticated: true,
                  token: jwt.sign({
                    id: user.id
                  }, config.secretKey),
                  user: userJSON
                });
              });
          }
        );
      })
      .catch(function(err) {
        return res.json(400, error);
      });
  };
  
  auth.post('/', authenticate);
  
  return auth;
};