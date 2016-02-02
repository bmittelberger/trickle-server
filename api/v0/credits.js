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
		if (!req.body.amount || !req.body.description ||
			!req.body.GroupId) {
			return res.json(400,error);
		}
		console.log(req.body);

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

  credits.post('/create',create);

  credits.put('/:id/amount', updateAmount);

  credits.put('/:id/balance', updateBalance);

  return credits;	
};