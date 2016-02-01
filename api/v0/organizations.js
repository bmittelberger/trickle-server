var express = require('express'),
    organizations = express.Router();

module.exports = function(models, config, utils) {
	var Organization = models.Organization;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup"
		})
	};

	var createOrganization = function(req,res) {
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

	var addUserToOrganization = function (req,res) {
		var error = {
			user : null
		}

	}


  

  organizations.use(utils.auth.authenticate);

  organizations.get('/', listAll);

  organizations.post('/createOrganization',createOrganization);

  organizations.post('/addUserToOrganization', addUserToOrganization)

  return organizations;	
};