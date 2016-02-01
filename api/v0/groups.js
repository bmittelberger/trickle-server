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
					error : err
				});
			});
	}

	// var editGroup = function(req, res) {
	// StoredGroup.
	// 	findAll({
	// 		where: {
	// 			GroupId : req.group.id
	// 		},
	// 		raw: true
	// 	})
	// }


  groups.get('/', listAll);

  groups.use(utils.auth.authenticate);

  groups.post('/addGroup',addGroup);

  return groups;	
};