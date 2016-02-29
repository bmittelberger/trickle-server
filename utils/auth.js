var jwt = require('jsonwebtoken')

module.exports = function(models, config) {
  var User = models.User;
  var UserOrganization = models.UserOrganization;
  var UserGroup = models.UserGroup;
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
    req.user.isOrganizationAdmin().then(function(isAdmin) {
      if (isAdmin) {
        next();
      } else {
        res.status(403);
      }
    });

    // UserOrganization
    //   .find({
    //     where: {
    //       UserId: req.user.id,
    //       OrganizationId: req.params.id
    //     }
    //   })
    //   .then(function(userOrganization) {
    //     if(userOrganization && userOrganization.isAdmin == true){
    //       next();
    //     } else {
    //       return res.status(403).json(error);
    //     }
    //   })
    //   .catch(function() {
    //     return res.status(403).json(error);
    //   });
  };


  var authenticateGroupAdmin = function(req, res, next) {
    UserGroup
      .find({
        where: {
          UserId: req.user.id,
          GroupId: req.params.id
        }
      })
      .then(function(userGroup) {
        if(userGroup && userGroup.isAdmin == true){
          next();
        } else {
          return res.status(403).json(error);
        }
      })
      .catch(function() {
        return res.status(403).json(error);
      });
  };
  
  return {
    authenticate: authenticate,
    authenticateOrganizationAdmin: authenticateOrganizationAdmin,
    authenticateGroupAdmin: authenticateGroupAdmin
  };
};