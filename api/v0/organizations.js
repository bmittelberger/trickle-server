var express = require('express'),
    organizations = express.Router();

module.exports = function(models, config, utils) {
	var Organization = models.Organization;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup"
		})
	};

	var addOrganization = function(req,res) {
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


  organizations.get('/', listAll);

  organizations.use(utils.auth.authenticate);

  organizations.post('/addOrganization',addOrganization);

  return organizations;	
};