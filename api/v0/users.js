var express = require('express'),
    users = express.Router();

module.exports = function(models, config, utils) {
  var User = models.User;
  var UserOrganization = models.UserOrganization;
  var Organization = models.Organization;
  var Transaction = models.Transaction;
  var UserGroup = models.UserGroup;
  var Group = models.Group;
  var Approval = models.Approval;
  
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

  var retrieveUser = function(req, res) {
    User
      .findById(req.params.id)
      .then(function(user) {
        if (!user) {
          return res.status(400).json({
            error : "User not found."
          });
        }
        return res.json({
          user : user.toJSON()
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          error : JSON.stringify(err)
        });
      });
  };

  var updateMe = function(req, res) {
    req.params.id = req.user.id;
    updateUser(req, res);
  };

  var updateUser = function(req, res) {
    if (!req.body.first || !req.body.last ||
        !req.body.email) {
      return res.json(400, error);
    }
    User
      .findById(req.params.id)
      .then(function(user) {
        if (!user) {
          return res.status(400).json({
            error : "User not found."
          });
        }
        user.update({
          first: req.body.first,
          last: req.body.last,
          email: req.body.email
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
      })
      .catch(function(err) {
        return res.status(400).json({
          error : JSON.stringify(err)
        });
      });
  };

  var deleteMe = function(req, res) {
    req.params.id = req.user.id;
    deleteUser(req, res);
  };

  var deleteUser = function(req, res) {
    User
      .findById(req.params.id)
      .then(function(user) {
        if (!user) {
          return res.status(400).json({
            error : "User not found."
          });
        }
        user.destroy()
        .then(function(count) {
          return res.json(200, {
            countRemoved: count 
          });
        })
        .catch(function(err) {
          return res.status(400).json({
            error : err
          });
        });  
      })
      .catch(function(err) {
        return res.status(400).json({
          error : JSON.stringify(err)
        });
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

  var addMeToGroup = function(req, res) {
    addUserToGroup(req.user,req,res);
  }

//need to check if groupId is valid. need to check if user is already in group
  var addUserToGroup = function(user, req, res) {
    if (!req.body.GroupId) {
      return res.status(400).json({
        error : 'Invalid request body'
      });
    }
    UserGroup
      .create({
        isAdmin : req.body.isAdmin === 'true',
        UserId : user.id,
        GroupId : req.body.GroupId
      })
      .then(function(userGroup) {
        return res.json({
          userGroup : userGroup  
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          error : JSON.stringify(err)
        });
      })
  };

  var removeMeFromGroup = function(req, res) {
    if (!req.body.GroupId) {
      return res.status(400).json({
        error : 'Invalid request body'
      });
    }
    console.log(req.body.GroupId);
    UserGroup
      .destroy({
        where: {
          UserId: req.user.id,
          GroupId: req.body.GroupId
        }
      })
      .then(function(userGroup) {
        return res.json({
          countRemoved : userGroup  
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          error : JSON.stringify(err)
        });
      })
  };

  var retriveUserTransactions = function(id, req, res) {
    Transaction
      .findAll({
        where : {
          UserId : id
        }
      })
      .then(function(transactions) {
        console.log(transactions)
        return res.json({
          transactions: transactions.map(function(transaction) {
            return transaction.toJSON();
          })
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          error : JSON.stringify(err)
        });
      });
  };

  var retrieveTransactions = function(req, res) {
    retriveUserTransactions(req.params.id, req, res);
  };

  var retrieveMyTransactions = function(req, res) {
    retriveUserTransactions(req.user.id, req, res)
  };

  var createMyTransaction = function(req, res) {
    if (!req.body.amount || !req.body.description ||
        !req.body.groupId) {
      return res.status(400).json( {
        error : "Invalid request body"
      });
    }
    Group
      .findById(req.body.groupId)
      .then(function(group) {
        if (!group) {
          return res.status(400).json({
            error : "Group not found."
          });
        }
        //check rules, and determine the status
          //if rejected -- no balance change -- DECLINED
          //if pass but no auto payment -- no balance change -- PENDING
          //if pass and auto payment -- balance change -- ACCEPTED
        Transaction
          .create( {
            amount : req.body.amount,
            description : req.body.description,
            message : req.body.message,
            status : Transaction.rawAttributes.status.values[0],
            UserId : req.user.id,
            GroupId : req.body.groupId
          }).then(function(transaction){

            return res.json({
              transaction : transaction
            })
          }).catch(function(err){
            return res.json(400,{
              error : err
            })
          });
      })
      .catch(function(err) {
        return res.json(400,{
          error : err
        })
      })
  };
  
  var retrieveMyApprovals = function(req, res) {
    var statuses = [];
    if (req.query.statuses) {
      statuses = req.query.statuses.split('|');
    } else {
      statuses = ['APPROVED',
                    'DECLINED',
                    'ACTIVE',
                    'EXPIRED'];
    }
    var userId = req.user.id;
    console.log(statuses);
    Approval
    .findAll({
      where: {
        UserId: userId,
        status: statuses
      },
        include: [{
          model: Transaction,
          include: [User]
        }]
    })
    .then(function(approvals) {
      return res.json({
        approvals : approvals.map(function(approval) {
              return approval.toJSON()
        })
      });
    })
    .catch(function(err) {
      return res.status(400).json({
        error: JSON.stringify(err)
      });
    });
  };

  users.post('/', create);
  
  users.use(utils.auth.authenticate);
  
  users.get('/me', me);
  users.get('/:id', retrieveUser)

  users.put('/me', updateMe)
  users.put('/:id', updateUser)

  users.delete('/me', deleteMe)
  users.delete('/:id', deleteUser)

  users.get('/me/organizations', retrieveMyOrganizations);
  users.get('/:id/organizations', retrieveOrganizations);

  users.get('/me/groups', retrieveMyGroups);
  users.get('/:id/groups', retrieveGroups);

  users.post('/me/groups', addMeToGroup);
  // users.post('/:id/groups', addToGroup);

  users.delete('/me/groups', removeMeFromGroup);
  // users.delete('/:id/groups', removeFromGroup);

  users.get('/me/transactions', retrieveMyTransactions);
  users.get('/:id/transactions', retrieveTransactions);

  users.post('/me/transactions', createMyTransaction);
  
  users.get('/me/approvals', retrieveMyApprovals);

  return users;
};