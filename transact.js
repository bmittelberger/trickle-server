var models = require('./models'),
    config = require('./config.json'),
    utils = require('./utils')(models, config),
    Transaction = models.Transaction,
    transactionUtils = utils.transaction;
    
Transaction.findById(6).then(function(t) {
  console.log(t.toJSON());
  transactionUtils.processTransaction(t, function() {
    console.log('continue on after save hook');
  });
});