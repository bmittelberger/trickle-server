var jwt = require('jsonwebtoken')

module.exports = function(models, config) {
  var User = models.User;
  var Organization = models.Organization;
  var error = {
    error: 'Not authorized.'
  };

  var authenticate = function(req, res, next) {
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
  
  var authenticateOrganizationAdmin = function(req, res, next) {
    // console.log ("in authenticateOrganizationAdmin");
    // console.log(req);
    // console.log (Organization);

    // Organization
    //   .findById(req.params.id)
    //   .then(function(organization) {
    //     console.log("here 1");
    //     console.log(organization);
    //   })
    //   .catch(function() {
    //     console.log("error 2");
    //     return res.status(403).json(error);
    //   });
  };
  
  return {
    authenticate: authenticate,
    authenticateOrganizationAdmin: authenticateOrganizationAdmin
  };
};