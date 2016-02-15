module.exports = function(models, config) {
  // var Transaction = models.Transaction;
  // var Promise = models.sequelize.Promise;
  // var UserGroup = models.UserGroup;
  // var Credit = models.Credit;
  var Approval = models.Approval;
  
  var createApproval = function(transaction, UserId) {
    var message = JSON.stringify(transaction.stateInfo.currentState);
    Approval
      .create({
        status : 'ACTIVE',
        message : message,
        UserId : UserId,
        TransactionId: transaction.id
      })
      .then(function(approval){ 
        console.log(approval);
      })
      .catch(function(err){
        console.log(err);
      });
  };
};