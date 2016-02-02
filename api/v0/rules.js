var express = require('express'),
    rules = express.Router();

module.exports = function(models, config, utils) {
	var Rule = models.Rule;

	var listAll = function(req,res) {
		return res.json({
			error : "You should never have to see all rules in the db. Why are you even trying?"
		})
	};

	var create = function(req,res) {
		var error = {
			credit : null
		};
		if (!req.body.type || !req.body.data ||
			!req.body.CreditId) {
			return res.status(400).json({
				error : 'Invalid request body.'
			});
		}
		Rule
			.create({
				type : Rule.rawAttributes.type.values[req.body.type],
				data : req.body.data,
				CreditId : req.body.CreditId,
			}).then(function(rule){
				return res.json({
					rule : rule.toJSON()
				});
			}).catch(function(err){
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	}


  

  rules.use(utils.auth.authenticate);

  rules.get('/', listAll);
  rules.post('/',create);

  return rules;	
};