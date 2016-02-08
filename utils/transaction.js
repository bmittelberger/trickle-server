var RuleType = {
  WINDOW_LIMIT: 'RULE_TYPE_WINDOW_LIMIT',
  RANGE_APPROVAL: 'RULE_TYPE_RANGE_APPROVAL'
};

var Window = {
  DAY: 'WINDOW_DAY',
  WEEK: 'WINDOW_WEEK',
  MONTH: 'WINDOW_MONTH'
};

var MS_IN_DAY = 1000 * 60 * 60 * 24;
var WindowLength = {
  WINDOW_DAY: 1 * MS_IN_DAY,
  WINDOW_WEEK: 7 * MS_IN_DAY,
  WINDOW_MONTH: 30 * MS_IN_DAY
};

var CreditSide = {
  EXTENDER: 'CREDIT_SIDE_EXTENDER',
  RECEIVER: 'CREDIT_SIDE_RECEIVER'
};

var ApprovalType = {
  NUMBER_MEMBER: 'APPROVAL_TYPE_NUMBER_MEMBER',
  PERCENTAGE_MEMBER: 'APPROVAL_TYPE_PERCENTAGE_MEMBER',
  NUMBER_ADMIN: 'APPROVAL_TYPE_NUMBER_ADMIN',
  PERCENTAGE_ADMIN: 'APPROVAL_TYPE_PERCENTAGE_ADMIN',
  DECLINE: 'APPROVAL_TYPE_DECLINE'
};

var ApprovalPriority = {
  APPROVAL_TYPE_NUMBER_MEMBER: 1,
  APPROVAL_TYPE_PERCENTAGE_MEMBER: 1,
  APPROVAL_TYPE_NUMBER_ADMIN: 2,
  APPROVAL_TYPE_PERCENTAGE_ADMIN: 2,
  APPROVAL_TYPE_DECLINE: 3
};

module.exports = function(models, config) {
  var Transaction = models.Transaction;
  var Promise = models.sequelize.Promise;
  // var Credit = models.Credit;
  
  var cumulativeTransactionAmountWithinWindow = function(transaction, credit, rule) {
    return Transaction.sum('amount', {
      where: {
        CreditId: credit.id,
        createdAt: {
          $lte: transaction.createdAt,
          $gte: new Date(transaction.createdAt - WindowLength[rule.window])
        },
        status: {
          $ne: 'DECLINED'
        }
      }
    });
  };
  
  var getRulePromises = function(transaction, credit) {
    return credit.rules.map(function(rule) {
      return new Promise(function(resolve, reject) {
        if (rule.type === RuleType.WINDOW_LIMIT) {
          cumulativeTransactionAmountWithinWindow(transaction, credit, rule)
            .then(function(amount) {
              rule.amount = amount;
              resolve(rule);
            })
            .catch(function(err) {
              reject(err);
            });
        } else {
          rule.amount = transaction.amount;
          resolve(rule);
        }
      });
    });
  };
  
  var processTransaction = function(transaction, cb) {
    transaction.getCredit().then(function(credit) {
      console.log(credit.toJSON());
      var rulePromises = getRulePromises(transaction, credit);
      Promise.all(rulePromises)
        .then(function(rules) {
          var rules = rules.filter(function(rule) {
            return (!rule.min || (rule.min <= rule.amount)) &&
                   (!rule.max || (rule.max > rule.amount));
          });
          // FIND STRICTEST RULES
          console.log(rules);
        })
        .catch(function(err) {
          console.log(err);
        });
      cb();
    }).catch(function(err) {
      console.log(err);
      cb();
    });
  };
  
  return {
    processTransaction: processTransaction
  };
};