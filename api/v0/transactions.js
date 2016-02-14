var express = require('express'),
    transactions = express.Router();

module.exports = function(models, config, utils) {
	var Transaction = models.Transaction;

	var listAll = function(req, res) {
		return res.json({
			sup : "There's no reason you should need to see ALL credits"
		})
	};

	var create = function(req, res) {
		var error = {
			error : 'Transaction could not be created'
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
				status : 'PENDING',
				UserId : req.user.id,
				GroupId : req.body.GroupId, 
				CreditId : req.body.CreditId
			}).then(function(transaction){
				return res.json({
					transaction : transaction
				});
			}).catch(function(err){
				return res.json(400,{
					error : JSON.stringify(err)
				})
			});
	};

	var retrieveTransaction = function(req, res) {
		Transaction
			.findById(req.params.id)
			.then(function(transaction) {
				if (!transaction) {
					return res.status(400).json( {
						error : 'Transaction not found.'
					});
				}
				return res.json({
					transaction : transaction
				});
			})
			.catch(function(err) { 
				return res.status(400).json({
					error : JSON.stringify(err)
				})
			});
	};

	var updateTransaction = function(req, res) {
		var t = req.body;
			if (t.status && (t.status != 'PENDING' &&
					t.status != 'APPROVED' && t.status != 'DECLINED')) {
				return res.status(400).json({
					error: 'Invalid new status value'
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
				transaction
					.updateAttributes({
						status: t.status ? t.status : transaction.status,
						message: t.message ? t.message : transaction.message

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

  transactions.get('/:id', retrieveTransaction);
  // transactions.post('/', createDemo);

  transactions.put('/:id/', updateTransaction);


	return transactions;
}