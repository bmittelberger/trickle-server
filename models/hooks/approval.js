module.exports = function(models) {
  
  var Promise = require('sequelize').Promise;
  var Approval = models.Approval;
  var Transaction = models.Transaction;
  var Credit = models.Credit;
  
  var getApprovalCounts = function(approval) {
    return new Promise(function(resolve, reject) {
      Approval.findAll({
        where: {
          TransactionId: approval.TransactionId,
          CreditId: approval.CreditId
        }
      })
      .then(function(approvals) {
        var approvedCount = 0;
        var declinedCount = 0;
        var totalCount = approvals.length;
        approvals.forEach(function(approval) {
          if (approval.status == 'APPROVED') {
            approvedCount++;
          } else if (approval.status == 'DECLINED') {
            declinedCount++;
          }
        });
        resolve({
          approvedCount: approvedCount,
          declinedCount: declinedCount,
          totalCount: totalCount
        })
      })
      .catch(function(err) {
        reject(err);
      })
    });
  };
  
  var processThreshold = function(transaction, counts) {
    return new Promise(function(resolve,reject) {
      var currentState = transaction.stateInfo.currentState;
      var requiredUsers = currentState.currentRule.requiredUsers;
      if (counts.approvedCount >= requiredUsers) {
        Credit
          .findById(currentState.CreditId)
          .then(function(credit) {
            if (!credit.ParentCreditId) {//we've reached the top!
              transaction
                .updateAttributes({
                  status: 'APPROVED'
                })
                .then(function(transaction) {
                  resolve(transaction);
                });
            } else {
              var parentId = credit.ParentCreditId;
              var newStateInfo = transaction.stateInfo;
              newStateInfo.history.push(newStateInfo.currentState);
              newStateInfo.currentState.CreditId = parentId;
              newStateInfo.currentState.currentRule = null;
              transaction
                .updateAttributes({
                  stateInfo: newStateInfo
                })
                .then(function(transaction) {
                  resolve(transaction);
                });
            }
          })
          .catch(function(err) {
            reject(err);
          })
        //grab parent credit from transaction's credit
        //if null --> set to approved --> afterUpdate hook in models/Transaction.js
        // will do the payment. Otherwise, grab parent creditId and update
        // current state for transaction
      } else if (counts.totalCount - counts.declinedCount
                  < requiredUsers) {
        //unable to reach threshold -- DECLINE
        transaction
          .updateAttributes({
            status: 'DECLINED',
            message: 'Did not pass group approval.'
          })
          .then(function(transaction) {
            resolve(transaction);
          })
          .catch(function(err) {
            reject(err);
          })
      }
    })
  };
 
  
  var processApprovalUpdate = function(approval, cb) {
    getApprovalCounts(approval)
      .then(function(counts){
        Transaction
          .findById(approval.TransactionId)
          .then(function(transaction) {
            processThreshold(transaction, counts);
            cb();
          });
      })
      .catch(function(err) {
        console.log(err);
      });
  }
  
  
  Approval.afterUpdate(function(approval, options, cb) {
    if (approval.status == 'ACTIVE') {
      cb();
    } else {
      processApprovalUpdate(approval, cb);
      cb();
    }
  })
  
}