var venmoUtils = require('../utils/venmo.js');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Transaction', {
    amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    description: {
      type: DataTypes.STRING
    },
    message: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'APPROVED',
        'DECLINED'
      )
    },
    processedAt: {
      type: DataTypes.DATE,
    }
  }, {
    hooks: {
      afterCreate: function(transaction, options, cb) {
        // transactionUtils.processTransaction(transaction, cb);
        if (transaction.amount > 250) {
          transaction
            .updateAttributes({
              status : 'DECLINED',
              message : 'The posted amount was over the demo amount of $100. Please try not being so greedy.'
            })
            .then(function(transaction) {
              cb();
            })
            .catch(function(err) {
              cb();
            });
        } else {
          venmoUtils.reimburse(transaction)
            .then(function(reimbursement) { 
              transaction
                .updateAttributes({
                  status : 'APPROVED',
                  message : 'Your transaction passed the auto-reimburse rules.'
                })
                .then(function(transaction) {
                  cb();
                })
                .catch(function(err) {
                  cb();
                });
            })
            .catch(function(err) {
              cb();
            });   
        }
      }
    }
  });
};