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
  
  var expireApprovals = function(transaction) {
    Approval.
      update(
        {
          status: 'EXPIRED'
        },
        {
          where: { 
            TransactionId: transaction.id,
            CreditId: transaction.CreditId,
            status: 'ACTIVE' 
            }
        })
        .catch(function(err) {
           console.log(err);
        });
  };
  
  var updateCredit = function(transaction, isSubtraction) {
    return new Promise(function(resolve, reject) {
      Credit
        .findById(transaction.CreditId)
          .then(function(credit) {
            var newBalance = credit.balance;
            if (isSubtraction) {
              newBalance = newBalance - transaction.amount;
            } else{
              newBalance = newBalance + transaction.amount;
            }
            credit.updateAttributes({
              balance: newBalance
            })
            .then(function(credit) {
              resolve(credit);
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
      var requiredUsers = currentState.currentRule.requiredUserNumber;
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
              var history = newStateInfo.history;
              var historyEntry = JSON.parse(JSON.stringify(transaction.stateInfo.currentState));
              history.push( historyEntry );
              newStateInfo.history = history;
              newStateInfo.currentState.CreditId = parentId;
              newStateInfo.currentState.currentRule = null;
              transaction
                .updateAttributes({
                  description: "new desctiption",
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
      } else if (counts.totalCount - counts.declinedCount
                  < requiredUsers) {
        transaction
          .updateAttributes({
            status: 'DECLINED',
            message: 'Did not pass group approval.'
          })
          .then(function(transaction) {
            updateCredit(transaction, false);
            expireApprovals(transaction);
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