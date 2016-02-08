var express = require('express'),
		groups = express.Router();

module.exports = function(models, config, utils) {
	var Group = models.Group;
	var Transaction = models.Transaction;
	var Credit = models.Credit;
	var UserGroup = models.UserGroup;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup"
		})
	};

	var create = function(req,res) {
		var error = {
			group : null
		};
		if (!req.body.name || !req.body.description ||
				!req.body.OrganizationId) {
			return res.json(400,error);
		}
		pId = req.body.ParentGroupId;
		Group
			.create({
				name : req.body.name,
				description : req.body.description,
				OrganizationId : req.body.OrganizationId,
				ParentGroupId : pId ? pId : null 
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
		Group
		.findById(req.params.id)
		.then(function(group) {
			if (!group) {
				return res.status(400).json({
					error : 'Group not found.'
				});
			}
			groups
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

	groups.get('/', listAll);
	groups.post('/', create);

	groups.get('/:id', retrieveGroup)
	groups.post('/:id/groups', createSubGroup)

	groups.get('/:id/users', retrieveUsers);

	groups.get('/:id/transactions', retrieveTransactions);

	groups.get('/:id/credits', retrieveCredits);

	return groups;	
};