var express = require('express'),
    organizations = express.Router();

module.exports = function(models, config, utils) {
	var Organization = models.Organization;
	var User = models.User;
	var UserOrganization = models.UserOrganization;

	var retrieveAll = function(req,res) {
		return res.json({
			sup : "sup"
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
			}).then(function(organization){
				return res.json(200,{
					organization : organization.toJSON()
				});
			}).catch(function(err){
				return res.status(400).json({
					error : err
				});
			});
	}

	var addUser = function (req, res) {
		var error = {
			user : null
		}
		if (!req.body.userId || !req.body.isAdmin) {
			return res.json(400,{
				error : 'invalid request body'
			})
		}
		var id = parseInt(req.params.id, 10);
		var newUserId = parseInt(req.body.userId, 10);
		User
			.findById(newUserId)	
			.then(function(user) {
				if (!user) {
					return res.status(400).json({
						error : 'User not found.'
					});
				}
				UserOrganization
					.create({
						UserId : newUserId,
						OrganizationId : id,
						isAdmin : req.body.isAdmin === 'true'
					})
					.then(function(relation) {
						return res.json({
							userOrganization : relation
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


  

  organizations.use(utils.auth.authenticate);

  organizations.get('/', retrieveAll);

  organizations.post('/', create);

  organizations.post('/:id/users', addUser)

  return organizations;	
};