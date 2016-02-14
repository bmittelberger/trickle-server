var express = require('express'),
    organizations = express.Router();

module.exports = function(models, config, utils) {
	var Organization = models.Organization;
	var User = models.User;
	var UserOrganization = models.UserOrganization;
	var Group = models.Group;

	var retrieveAll = function(req,res) {
		return res.json({
			error : "there's no reason you should need to see ALL organizations"
		})
	};

	var create = function(req,res) {
		var error = {
			organization : null
		};
		if (!req.body.name || !req.body.description) {
			return res.json(400,error);
		}
		Organization
			.create({
				name : req.body.name,
				description : req.body.description,
				venmo : req.body.venmo
			})
			.then(function(organization){
				UserOrganization
					.create({
						UserId : req.user.id,
						OrganizationId : organization.toJSON().id,
						isAdmin : true
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});	
					});
				return res.json({
					organization : organization.toJSON()
				});
			})
			.catch(function(err){
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	};

	var retrieveOrganization = function(req, res) {
		id = req.params.id;
		Organization
			.findById(id)
			.then(function(organization) {
				if (!organization) {
					return res.status(400).json( {
						error : "Organization not found."
					});
				}
				return res.json({
					organization : organization.toJSON()
				});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				})
			});
	};


	var addUser = function (req, res) {
		if (!req.body.UserId) {
			return res.json(400,{
				error : 'invalid request body'
			})
		}
		User
			.findById(req.user.id)	
			.then(function(user) {
				if (!user) {
					return res.status(400).json({
						error : 'User not found.'
					});
				}
				UserOrganization
					.create({
						UserId : req.body.UserId,
						OrganizationId : req.params.id,
						isAdmin : req.body.isAdmin === 'true'
					})
					.then(function(relation) {
						return res.json({
							UserOrganization : relation.toJSON()
						});
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
			})
			.catch(function(err) {
				console.log('in catch')
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
		UserOrganization
			.destroy({
				where: {
					UserId: req.body.UserId,
					OrganizationId: req.params.id,
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

  var retrieveUsers = function (req, res) {
  	var error = {
  		users : null
  	}
  	Organization
  		.findById(req.params.id)
  		.then(function(organization) {
  			organization
  				.getUsers()
  				.then(function(users) {
  					return res.json({
  						users : users.map(function(user) {
  							return user.toJSON()
  						})
  					});
  				})
  		})
  		.catch(function(err) {
  			return res.status(400).toJSON({
  				error : JSON.stringify(err)
  			});
  		});
  };

  var retrieveGroups = function(req, res) {
  	Organization.
  		findById(req.params.id)
  		.then(function(organization) {
  			if (!organization) {
  				return res.status(400).json({
  					error : 'Organization not found.'
  				});
  			}
		  	Group.
		  		findAll({
		  			where : {
		  				OrganizationId : req.params.id
		  			}
		  		})
		  		.then(function(groups) {
		  			return res.json({
		  				groups : groups.map(function(group) {
		  					return group.toJSON();
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

  organizations.use(utils.auth.authenticate);

  organizations.get('/', retrieveAll);
  organizations.post('/', create);


  organizations.get('/:id', retrieveOrganization);

  organizations.get('/:id/users', retrieveUsers);

  organizations.get('/:id/groups', retrieveGroups)
  
  organizations.use('/:id', utils.auth.authenticateOrganizationAdmin);

  organizations.post('/:id/users', addUser);
  organizations.delete('/:id/users', removeUser);

  return organizations;	
};