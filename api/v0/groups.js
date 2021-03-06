var express = require('express'),
		groups = express.Router();

module.exports = function(models, config, utils) {
	var Group = models.Group;
	var Transaction = models.Transaction;
	var Credit = models.Credit;
	var UserGroup = models.UserGroup;
	var User = models.User;

	var findGroups = function(req,res) {
     if (!req.query.query) {
      return res.status(400).json({
        error: 'Please a query string.'
      });
    }
    Group
      .findAll({
        where : {
          name: {
            $iLike : "%" + req.query.query + "%"
          }
        }
      })
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

	var create = function(req,res) {
		if (!req.body.name || !req.body.description ||
				!req.body.OrganizationId) {
			return res.status(400).json({
        error : "Invalid request body."
      });
		}
		pId = req.body.ParentGroupId;
		Group
			.create({
				name : req.body.name,
				description : req.body.description,
				OrganizationId : req.body.OrganizationId
			})
			.then(function(group){
				UserGroup
					.create({
						UserId : req.user.id,
						GroupId : group.toJSON().id,
						isAdmin : true
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
				return res.json(200,{
					group : group.toJSON()
				});
			})
			.catch(function(err){
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	};

	var retrieveGroup = function(req, res) {
		var id = req.params.id;
		Group
			.findById(id)
			.then(function (group) {
				if (!group) {
					return res.status(400).json({
						error : "Group not found."
					});
				}
				return res.json({
					group : group
				});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : err
				});
			});
	};

	var updateGroup = function(req, res) {
		Group
			.findById(req.params.id)
			.then(function (group) {
				if (!group) {
					return res.status(400).json({
						error : "Group not found."
					});
				}
				group
					.setAttributes({
						name : req.body.name ? req.body.name : group.name,
						description : req.body.description ? req.body.description : group.description
					})
					.then(function(group) {
						return res.json({
							group : group
						})
					})
			})
			.catch(function(err) {
				return res.status(400).json({
					error : err
				});
			});
	};
	

	var createSubGroup = function(req,res) {
		var error = {
			group : null
		};
		if (!req.body.name || !req.body.description) {
			return res.json(400,error);
		}
		var id = req.params.id;
		Group
			.findById(id)
			.then(function (group) {
				if (!group) {
					return res.status(400).json({
						error : "Group not found."
					});
				}
				Group
					.create({
						name : req.body.name,
						description : req.body.description,
						ParentGroupId : group.id,
						OrganizationId : group.OrganizationId
					})
					.then(function(group){
						UserGroup
							.create({
								UserId : req.user.id,
								GroupId : group.toJSON().id,
								isAdmin : true
							})
							.catch(function(err) {
								return res.status(400).json({
									error : JSON.stringify(err)
								});
							});
						return res.json(200,{
							group : group.toJSON()
						});
					})
					.catch(function(err){
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : err
				});
			})
	};

	var retrieveUsers = function(req, res) {
		var id = req.params.id
		Group
		.findById(id)
		.then(function(group) {
			if (!group) {
				return res.status(400).json({
					error : 'Group not found.'
				});
			}
			group
				.getUsers()
				.then(function(users) {
					return res.json({
						users : users.map(function(user){
							return user.toJSON();
						})
					});
				})
				.catch(function(err) {
					return res.status(400).json({
						here : 1,
						error : JSON.stringify(err)
					});
				})
		})
		.catch(function(err) {
			return res.status(400).json({
				id : req.params.id,
				here : 2,
				error : JSON.stringify(err)
			});
		});
	};

	var addUser = function (req, res) {
		if (!req.body.UserId) {
			return res.json(400,{
				error : 'invalid request body'
			})
		}
		User
			.findById(req.body.UserId)	
			.then(function(user) {
				if (!user) {
					return res.status(400).json({
						error : 'User not found.'
					});
				}
				UserGroup
					.create({
						UserId : req.body.UserId,
						GroupId : req.params.id,
						isAdmin : req.body.isAdmin === 'true'
					})
					.then(function(userGroup) {
						return res.json({
							UserGroup : userGroup.toJSON()
						});
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				})
			});
	};

	var removeUser = function (req, res) {
		if (!req.body.UserId) {
			return res.json(400,{
				error : 'invalid request body'
			})
		}
		UserGroup
			.destroy({
				where: {
					UserId: req.body.UserId,
					GroupId: req.params.id,
				}
			})
			.then(function(count) {
				return res.json({
					countRemoved : count
				});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	};

	var retrieveSubgroups = function(req, res) {
		Group
		.findById(req.params.id)
		.then(function(group) {
			if (!group) {
				return res.status(400).json({
					error : 'Parent group not found.'
				});
			}
			Group
				.findAll({
					where: {
						ParentGroupId: req.params.id
					}
				})
				.then(function(groups) {
					return res.json({
						groups : groups.map(function(group){
							return group.toJSON();
						})
					});
				})
				.catch(function(err) {
					return res.status(400).json({
						error : JSON.stringify(err)
					});
				})
		})
		.catch(function(err) {
			return res.status(400).json({
				error : JSON.stringify(err)
			});
		});
	};

	var retrieveTransactions = function(req, res) {
		Group
		.findById(req.params.id)
		.then(function(group) {
			if (!group) {
				return res.status(400).json({
					error : 'Group not found.'
				});
			}
			Transaction
				.findAll({
					where : {
						GroupId : req.params.id
					}
				})
				.then(function(transactions) {
					return res.json({
						transactions : transactions.map(function(transaction) {
							return transaction.toJSON();
						})
					});
				})
				.catch(function(err) {
					return res.status(400).json({
						error : JSON.stringify(err)
					});
				})
		})
		.catch(function(err) {
			return res.status(400).json({
				error : JSON.stringify(err)
			});
		});
	};

	var retrieveCredits = function(req, res) {
  	Group.
  		findById(req.params.id)
  		.then(function(group) {
  			if (!group) {
  				return res.status(400).json({
  					error : 'Group not found.'
  				});
  			}
		  	Credit.
		  		findAll({
		  			where : {
		  				GroupId : req.params.id
		  			}
		  		})
		  		.then(function(credits) {
		  			return res.json({
		  				credits : credits.map(function(credit) {
		  					return credit.toJSON();
		  				})
		  			});
		  		})
		  		.catch(function(err) {
		  			return res.status(400).json({
		  				error : JSON.stringify(err)
		  			});
		  		});
		  	})
  		.catch(function(err) {
  			return res.status(400).json({
  				error : JSON.stringify(err)
  			});
  		});
  };


	groups.use(utils.auth.authenticate);

	groups.get('/', findGroups);
	groups.post('/', create);

	groups.get('/:id', retrieveGroup)

	groups.get('/:id/users', retrieveUsers);
	groups.get('/:id/groups', retrieveSubgroups);
	groups.get('/:id/transactions', retrieveTransactions);
	groups.get('/:id/credits', retrieveCredits);

	groups.use('/:id', utils.auth.authenticateGroupAdmin);

  	groups.post('/:id/users', addUser);
	groups.delete('/:id/users', removeUser);

	groups.post('/:id/groups', createSubGroup)
	groups.put('/:id', updateGroup);

	return groups;	
};