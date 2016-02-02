var express = require('express'),
		groups = express.Router();

module.exports = function(models, config, utils) {
	var Group = models.Group;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup"
		})
	};

	var addGroup = function(req,res) {
		var error = {
			group : null
		};
		if (!req.body.name || !req.body.description) {
			return res.json(400,error);
		}
		Group
			.create({
				name : req.body.name,
				description : req.body.description,
			}).then(function(group){
				return res.json(200,{
					group : group.toJSON()
				});
			}).catch(function(err){
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	}



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


	groups.use(utils.auth.authenticate);

	groups.get('/', listAll);
	groups.post('/',addGroup);

	groups.get('/:id/users', retrieveUsers);

	return groups;	
};