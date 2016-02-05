var express = require('express'),
    credits = express.Router();

module.exports = function(models, config, utils) {
	var Credit = models.Credit;
	var Transaction = models.Transaction;

	var listAll = function(req,res) {
		return res.json({
			sup : "sup credits"
		})
	};

	var create = function(req,res) {
		var error = {
			credit : null
		};
		if (!req.body.amount || !req.body.description ||
			!req.body.GroupId) {
			return res.status(400).json({
				error : "Invalid request body."
			});
		}
		Credit
			.create({
				amount : req.body.amount,
				balance : req.body.amount,
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
	};

	var createSubCredit = function(req, res) {
		if (!req.body.GroupId || !req.body.amount ||
				!req.body.description) {
			return res.status(400).json({
				error : 'Invalid request body'
			});
		}
		Credit
			.findById(req.params.id)
			.then(function(parentCredit) {
				if (!parentCredit) {
					return res.status(400).json({
						error : 'Parent credit not found.'
					});
				}
				if (parentCredit.balance < req.body.amount) {
					return res.status(400).json({
						error : 'New credit amount greater than available parent balance.'
					});
				}
				parentCredit
					.updateAttributes({
						balance : (parentCredit.balance - req.body.amount)
					})
					.then(function(parentCredit) {
						Credit
							.create({
								amount : req.body.amount,
								balance : req.body.amount,
								description : req.body.description,
								GroupId : req.body.GroupId
								
								//TODO: set parent credit id
								//ParentCreditId : parentCredit.id
							})
							.then(function(credit) {
								return res.json({
									credit : credit.toJSON()
								});
							})
							.catch(function(err) {
								return res.staus(400).json({
									error : JSON.stringify(err)
								});
							});
					})
					.catch(function(err) {
						return res.staus(400).json({
							error : JSON.stringify(err)
						});
					})
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	}

	var retrieveTransactions = function(req, res) {
		Credit
			.findById(req.params.id)
			.then(function(credit) {
				if (!credit) {
					return res.status(400).json({
						error : 'Credit not found.'
					})
				}
				Transaction
					.findAll({
						where : {
							CreditId : credit.id
						}
					})
					.then(function(transactions) {
						return res.json({
							transactions : transactions.map(function(transaction) {
								return transaction.toJSON();
							});
						})
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	}

	/* NOTE: Balance will be reset to new amount*/
	var updateAmount = function(req, res) {
		if (!req.body.newAmount) {
			return res.status(400).json({
				error : 'Invalid request body.'
			});
		}
		Credit
			.findById(req.params.id)
			.then(function(credit) {
				if (!credit) {
					return res.status(400).json({
						error : 'Credit not found.'
					})
				}
				credit
					.updateAttributes({
						amount : req.body.newAmount,
						balance : req.body.newAmount
					})
					.then(function(credit) {
						return res.json({
							credit : credit.toJSON()
						});
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	};


	var updateBalance = function(req, res) {
		if (!req.body.newBalance) {
			return res.status(400).json({
				error : 'Invalid request body.'
			});
		}
		Credit
			.findById(req.params.id)
			.then(function(credit) {
				if (!credit) {
					return res.status(400).json({
						error : 'Credit not found.'
					})
				}
				if (req.body.newBalance > credit.amount) {
					return res.status(400).json({
						error : 'Balance cannot be greater than the line of credit.'
					});
				}
				credit
					.updateAttributes({
						balance : req.body.newBalance
					})
					.then(function(credit) {
						return res.json({
							credit : credit.toJSON()
						});
					})
					.catch(function(err) {
						return res.status(400).json({
							error : JSON.stringify(err)
						});
					});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	};


  credits.get('/', listAll);

  credits.use(utils.auth.authenticate);

  credits.post('/',create); //create a base credit -- no parent credits

	//create a sub-credit from provided creditId
  credits.post('/:id/credits', createSubCredit) 


  //DOESNT WORK YET -- MUST ADD the CreditId to Transaction list
  //credits.get('/:id/transactions', retrieveTransactions)
  
  credits.put('/:id/amount', updateAmount);

  credits.put('/:id/balance', updateBalance);


  return credits;	
};