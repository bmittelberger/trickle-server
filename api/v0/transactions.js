var express = require('express'),
    transactions = express.Router();

module.exports = function(models, config, utils) {
	var Transaction = models.Transaction;
  var Credit = models.Credit;
  var Group = models.Group;
  var User = models.User;

	var create = function(req, res) {
		var error = {
			error : 'Transaction could not be created'
		};
		if (!req.body.amount || !req.body.title ||
			!req.body.GroupId || !req.body.CreditId ||
			!req.body.category || !req.body.location) {
			return res.json(400,error);
		}

    var recordState = {
      currentState: {
        CreditId: req.body.CreditId,
        currentRule: null
      },
      history: []
    };
		Transaction.
			create({
				amount : req.body.amount,
				title : req.body.title,
				category : req.body.category,
				location : req.body.location,
				status : 'PENDING',
				UserId : req.user.id,
				GroupId : req.body.GroupId, 
				CreditId : req.body.CreditId,
        stateInfo: recordState
			}).then(function(transaction){
          return res.json({
            transaction : transaction
          });				
			}).catch(function(err){
        console.log(err)
				return res.json(400,{
					error : JSON.stringify(err)
				})
			});
	};

	var retrieveTransaction = function(req, res) {
		Transaction
			.find({ 
        where: { 
           id: req.params.id
        }, 
          include: [Group,Credit,User] 
      })
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
						category: t.category ? t.category : transaction.category,
						location: t.location ? t.location : transaction.location
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

  transactions.post('/', create);

  transactions.get('/:id', retrieveTransaction);
  // transactions.post('/', createDemo);

  transactions.put('/:id/', updateTransaction);


	return transactions;
}