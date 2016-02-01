var express = require('express'),
    transactions = express.Router();

module.exports = function(models, config, utils) {
	var Transaction = models.Transaction;

	var listAll = function(req, res) {
		return res.json({
			sup : 'sup'
		})
	};

	var create = function(req, res) {
		var error = {
			transaction : null
		};
		if (!req.body.amount || !req.body.description ||
			  !req.body.GroupId) {
			return res.json(400,error);
		}

		//TODO: add logic for rules to determine status
		//and payment options (auto-payment possible)
		Transaction.
			create({
				amount : req.body.amount,
				description : req.body.description,
				message : req.body.message,
				status : Transaction.rawAttributes.status.values[0],
				UserId : req.user.id,
				GroupId : req.body.GroupId
			}).then(function(transaction){
				return res.json({
					transaction : transaction
				})
			}).catch(function(err){
				return res.json(400,{
					error : err
				})
			});
	};

	


	transactions.use(utils.auth.authenticate);

  transactions.get('/', listAll);

  transactions.post('/create', create);

  // transactions.post('/changeStatus', changeStatus);

	return transactions;
}