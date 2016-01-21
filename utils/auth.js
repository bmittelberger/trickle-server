var jwt = require('jsonwebtoken')

module.exports = function(models, config) {
  var User = models.User;
  
  var authenticate = function(req, res, next) {
    var error = {
      error: 'Not authorized.'
    };
    try {
      var token = req.body.token || req.query.token ||
                  req.headers['x-access-token'],
          user = jwt.verify(token, config.secretKey);

      User
        .findById(user.id)
        .then(function(user) {
          req.user = user;
          next();
        })
        .catch(function(err) {
          return res.status(403).json(error);
        });
    } catch(err) {
      return res.status(403).json(error);
    }
  };
  
  return {
    authenticate: authenticate
  };
};