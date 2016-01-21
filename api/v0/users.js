var express = require('express'),
    users = express.Router();

module.exports = function(models, config, utils) {
  var User = models.User;
  
  var create = function(req, res) {
    var error = {
      user: null
    };
    if (!req.body.first || !req.body.last ||
        !req.body.email || !req.body.password) {
      return res.json(400, error);
    }
    User
      .create({
        first: req.body.first,
        last: req.body.last,
        email: req.body.email,
        password: req.body.password
      })
      .then(function(user) {
        return res.json(200, {
          user: user.toJSON()
        });
      })
      .catch(function(err) {
        return res.json(400, error);
      });
  };
  
  var me = function(req, res) {
    return res.json({
      user: req.user
    });
  };
  
  users.post('/', create);
  
  users.use(utils.auth.authenticate);
  
  users.get('/me', me);
  
  return users;
};