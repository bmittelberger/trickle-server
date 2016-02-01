var express = require('express'),
    users = express.Router();

module.exports = function(models, config, utils) {
  var User = models.User;
  var UserOrganization = models.UserOrganization;
  var Organization = models.Organization;
  
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
        return res.status(400).json({
          error : err
        });
      });  
  };
  
  var me = function(req, res) {
    return res.json({
      user: req.user
    });
  };

  var retrieveUserOrganizations = function(user, req, res) {
    user
      .getOrganizations()
      .then(function(organizations) {
        return res.json({
          organizations: organizations.map(function(organization) {
            return organization.toJSON();
          })
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          error: JSON.stringify(err)
        });
      });
  };

  var retrieveMyOrganizations = function(req, res) {
    retrieveUserOrganizations(req.user, req, res);
  };
  
  var retrieveOrganizations = function(req, res) {
    User
      .findById(req.params.id)
      .then(function(user) {
        if (!user) {
          return res.status(400).json({
            error: "User not found."
          });
        }
        return retrieveUserOrganizations(user, req, res);
      })
      .catch(function(err) {
        return res.status(400).json({
          error: JSON.stringify(err)
        });
      });
  };

  var retrieveUserGroups = function(user, req, res) {
    user
      .getGroups()
      .then(function(groups) {
        return res.json({
          groups: groups.map(function(group) {
            return group.toJSON();
          })
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          error: JSON.stringify(err)
        });
      });
  };

  var retrieveMyGroups = function(req, res) {
    retrieveUserGroups(req.user, req, res);
  };

  var retrieveGroups = function(req, res) {
    User
      .findById(req.params.id)
      .then(function(user) {
        if (!user) {
          return res.status(400).json({
            error: "User not found."
          });
        }
        return retrieveUserGroups(user, req, res);
      })
      .catch(function(err) {
        return res.status(400).json({
          error: JSON.stringify(err)
        });
      });
  };


  var addUserVenmo = function(req, res) {
    var error = {
      'error' : 'Must submit valid venmo information'
    };
    if (!req.body.venmoData){
      return res.json(400,error)
    }
    return res.json({
      'success' : 'success'
    });
  };

  users.post('/', create);
  
  users.use(utils.auth.authenticate);
  
  users.get('/me', me);

  users.get('/me/organizations', retrieveMyOrganizations);
  users.get('/:id/organizations', retrieveOrganizations);

  users.get('/me/groups', retrieveMyGroups);
  users.get('/:id/groups', retrieveGroups)

  users.get('/getUserTransactions', getUserTransactions);
  
  return users;
};