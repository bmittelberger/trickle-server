var express = require('express'),
    credits = express.Router();

module.exports = function(models, config, utils) {
	var Credit = models.Credit;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup credits"
		})
	};

	var create = function(req,res) {
		var error = {
			credit : null
		};
		if (!req.body.balance || !req.body.description ||
			!req.body.GroupId) {
			return res.json(400,error);
		}
		console.log(req.body);

		Credit
			.create({
				balance : req.body.balance,
				description : req.body.description,
				GroupId : req.body.GroupId,
			}).then(function(credit){
				return res.json(200,{
					credit : credit.toJSON()
				});
			}).catch(function(err){
				return res.status(400).json({
					error : err
				});
			});
	}


  credits.get('/', listAll);

  credits.use(utils.auth.authenticate);

  credits.post('/create',create);

  return credits;	
};