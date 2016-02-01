var express = require('express'),
    rules = express.Router();

module.exports = function(models, config, utils) {
	var Rule = models.Rule;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup rules"
		})
	};

	var create = function(req,res) {
		var error = {
			credit : null
		};
		if (!req.body.type || !req.body.data ||
			!req.body.CreditId) {
			return res.json(400,error);
		}
		console.log(req.body);

		Rule
			.create({
				type : Rule.rawAttributes.type.values[req.body.type],
				data : req.body.data,
				CreditId : req.body.CreditId,
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


  rules.get('/', listAll);

  rules.use(utils.auth.authenticate);

  rules.post('/create',create);

  return rules;	
};