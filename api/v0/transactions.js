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
			  !req.body.GroupId || !req.body.CreditId) {
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
				GroupId : req.body.GroupId, 
				CreditId : req.body.CreditId
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

	var updateStatus = function(req, res) {
		if (!req.body.status) {
			return res.status(400).json({
				error : 'Invalid request body.'
			});
		}
		Transaction
			.findById(req.params.id)
			.then(function(transaction) {
				if (!transaction) {
					return res.status(400).json({
						error : 'Transaction not found.'
					})
				}
				var statusIndex;
				if (req.body.status == 'PENDING') {
					statusIndex = 0;
				} else if (req.body.status == 'APPROVED') {
					statusIndex = 1;
				} else if (req.body.status == 'DECLINED') {
					statusIndex = 2;
				} else {
					return res.status(400).json({
						error : 'Invalid status value.'
					});
				}
				transaction
					.updateAttributes({
						status : Transaction.rawAttributes.status.values[statusIndex],
						message : req.body.message ? req.body.message : transaction.message
					})
					.then(function(transaction) {
						return res.json({
							transaction : transaction.toJSON()
						});
					})
					.catch(function(err) {
						return res.status(400).json({
							error : err
						});
					});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : err
				});
			});
	};


	transactions.use(utils.auth.authenticate);

  transactions.get('/', listAll);
  transactions.post('/', create);

  transactions.put('/:id/status', updateStatus);


	return transactions;
}