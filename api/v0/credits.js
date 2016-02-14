var express = require('express'),
    credits = express.Router();

module.exports = function(models, config, utils) {
	var Credit = models.Credit;
	var Transaction = models.Transaction;
	var TransactionStatuses = models.Transaction.rawAttributes.status.values;
	var Promise = models.sequelize.Promise;

	var listAll = function(req,res) {
		return res.json({
			error : "There's no reason you should need to see ALL credits"
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
				rules : req.body.rules
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

	var retrieveCredit = function(req, res) {
		Credit
			.findById(req.params.id)
			.then(function(credit) {
				if (!credit) {
					return res.status(400).json({
						error : 'Credit not found.'
					});
				}
				return res.json({
					credit : credit.toJSON()
				});
			})
			.catch(function(err) {
				return res.status(400).json({
					error : JSON.stringify(err)
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
								GroupId : req.body.GroupId,
								ParentCreditId : parentCredit.id
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
						},
						order: '"createdAt" DESC' 
					})
					.then(function(transactions) {
						return res.json({
							transactions : transactions.map(function(transaction) {
								return transaction.toJSON();
							})
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
	}

	var checkUpdateValidity = function(credit,newCredit) {
		return new Promise(function(resolve, reject) {
			if (!credit.ParentCreditId || !newCredit.amount) {
				var validity =  {
					valid : true,
				};
				resolve(validity);
			}
			if (!newCredit.amount && newCredit.balance &&
					newCredit.balance > credit.amount) {
				var validity = {
					valid : false,
					error : 'New balance cannot exceed current credit line amount'
				};
				resolve(validity);
			}
			Credit
				.findById(credit.ParentCreditId)
				.then(function(parentCredit) {
					availableAmount = parentCredit.balance + credit.amount;
					if (availableAmount - newCredit.amount < 0) {
						var validity = {
							valid : false,
							error : 'Insufficient funds in parent credit balance for new amount.'
						};
						resolve(validity);
					}
					newParentBalance = parentCredit.balance + credit.amount 
														 - newCredit.amount;
					parentCredit
						.updateAttributes({
							balance : newParentBalance
						})
						.then(function(parentCredit) {
							validity = {
								valid: true,
								parentCredit : parentCredit
							};
							resolve(validity)
						});
				})
				.catch(function(err) { 
					validity = {
						valid: false,
						error : JSON.stringify(err)
					};
					resolve(validity);
				})
		});
	};

	var updateCredit = function(req, res) {
		newCredit = req.body;
		if (newCredit.amount && 
				Number(newCredit.amount) != newCredit.amount) {
			return res.status(400).json({
				error: 'Invalid format for new amount.'
			});
		}
		if (newCredit.balance && 
				Number(newCredit.balance) != newCredit.balance) {
			return res.status(400).json({
				error: 'Invalid format for new balance.'
			});
		}
		if (newCredit.amount && newCredit.balance &&
				newCredit.balance > newCredit.amount) {
			return res.status(400).json({
				error : 'New balance cannot exceed new credit line amount.'
			})
		}
		Credit
			.findById(req.params.id)
			.then(function(credit) {
				if (!credit) {
					return res.status(400).json({
						error : 'Credit not found.'
					})
				}
				var validityPromise = checkUpdateValidity(credit,newCredit);
				validityPromise.then(function(validity) {
					if (!validity.valid) {
						return res.status(400).json({
							error : validity.error
						})
					}
					if (newCredit.amount && !newCredit.balance) {
						var newBalance = newCredit.amount - credit.amount + credit.balance;
						if (newBalance < 0) {
							return res.status(400).json({
								error : 'Balance constraints prevent new amount.'
							})
						} else {
							newCredit.balance = newBalance;
						}
					}
					credit
						.updateAttributes({
							amount : newCredit.amount != null ? newCredit.amount : credit.amount,
							balance : newCredit.balance != null ? newCredit.balance : credit.balance,
							description : newCredit.description ? newCredit.description : credit.description,
							rules : newCredit.rules ? newCredit.rules : credit.rules
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
				});
			})
			.catch(function(err) {
				console.log('here8');
				return res.status(400).json({
					error : JSON.stringify(err)
				});
			});
	};

	var retrieveParentCredit = function(credit) {
		Credit
			.findById(credit.ParentCreditId)
			.then(function(parentCredit) {
				return parentCredit;
			})
			.catch(function(err) {
				return null;
			});
	};

  credits.get('/', listAll);

  credits.use(utils.auth.authenticate);

  credits.post('/',create); //create a base credit -- no parent credits

  credits.get('/:id', retrieveCredit);

	//create a sub-credit from provided creditId
  credits.post('/:id/credits', createSubCredit);

  credits.get('/:id/transactions', retrieveTransactions)
  
  credits.put('/:id', updateCredit);



  return credits;	
};