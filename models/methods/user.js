module.exports = function(models, bindMethodFn) {
  
  var Promise = require('sequelize').Promise;
  var UserOrganization = models.UserOrganization;
  var User = models.User;

  bindMethodFn(User, 'isOrganizationAdmin', function() {
    return new Promise(function(resolve, reject) {
      UserOrganization
        .find({
          where: {
            UserId: this.id
          }
        })
        .then(function(userOrganization) {
          if(userOrganization && userOrganization.isAdmin == true) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(function() {
          resolve(false);
        });
    }.bind(this));
  });
}