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
  
  var getUserOrganizations = function(req, res) {
    organizations = []
    UserOrganization. //first grab all the matching organization Ids
      findAll({
        attributes : 
          ['UserId','OrganizationId','isAdmin']
        ,
        where: {
          UserId : req.user.id
        },
        raw: true
      })
      .then(function(relations) { //then pull those organizations from the model
        if (relations.length > 0) {
          var organizationIds = []
          for (entry in relations) { 
            organizationIds.push(entry.OrganizationId)
          }
          Organization.
            findAll({
              where : {
                id : organizationIds
              },
              raw : true
            }).then(function(organzations){
              return res.json({
                organizations : organizations
              })
            }).catch(function(err) {
              return res.json({
                error : err
              })
            });
        } else {
          return res.json({
            "Organizations" : []
          })
        }
      }).
      catch(function(err) {
        return res.json({
          error : err
        })
      });
  };

  var getUserGroups = function(req, res) {
    return res.json({
      'groups' : []
    });
  };

  var getUserTransactions = function(req, res) {
    return res.json({
      'transactions' : []
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

  users.get('/getUserOrganizations', getUserOrganizations);

  users.get('/getUserGroups', getUserGroups);

  users.get('/getUserTransactions', getUserTransactions);

  users.post('/addUserVenmo', addUserVenmo);
  
  return users;
};