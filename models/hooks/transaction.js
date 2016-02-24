var venmoUtils = require('../../utils/venmo.js');

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



module.exports = function(models) {
  var Transaction = models.Transaction;
  var UserGroup = models.UserGroup;
  var Approval = models.Approval;
  var Credit = models.Credit;
  
  var createApproval = function(transaction, UserId) {
    var currentState = transaction.stateInfo.currentState;
    Approval
      .create({
        status : 'ACTIVE',
        UserId : UserId,
        TransactionId: transaction.id,
        CreditId: currentState.CreditId
      })
      // .then(function(approval){ 
      //   console.log(approval.toJSON());
      // })
      .catch(function(err){
        console.log(err);
      });
  };

  
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
              if (isNaN(amount)) {
                amount = 0;
              }
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
  
  
  //Get info on what users are in the child group and
  //parent group. Used for tie breakers as well as for
  //processing approval requests
  var getGroupData = function(relations,group) {
    var parentGroupMembers = [];
    var parentGroupAdmins = [];
    var childGroupMembers = [];
    var childGroupAdmins = [];
    relations.forEach(function(relation){
      if (relation.GroupId == group.id) {
        if (relation.isAdmin) {
          childGroupAdmins.push(relation.UserId);
        }
        childGroupMembers.push(relation.UserId);
      } else {
        if (relation.isAdmin) {
          parentGroupAdmins.push(relation.UserId);
        }
          parentGroupMembers.push(relation.UserId);
      }
    });
    return {
      parentGroup: {
        id: group.ParentGroupId,
        members: parentGroupMembers,
        admins: parentGroupAdmins
      },
      childGroup: {
        id: group.id,
        members: childGroupMembers,
        admins: childGroupAdmins
      }
    };
  };
  
  var getGroupsDataPromise = function(credit) {
    return new Promise(function(resolve, reject) {
      credit.getGroup().then(function(group) {
        var groupIds = [group.id];
        if (group.ParentGroupId) {
          groupIds.push(group.ParentGroupId);
        }
        UserGroup.findAll({
          where : {
            GroupId: groupIds
          }
        })
        .then(function(relations) { 
           resolve(getGroupData(relations,group));
        });
      })
      .catch(function(err) {
        reject(err);
      })
    });
  };
  
  var getRequiredUsers = function(rule, members, admins, groupData) {
    if (rule.side == CreditSide.EXTENDER) {
      if (groupData.parentGroup){
        rule.requiredGroupId = groupData.parentGroup.id
      }
    } else {
      rule.requiredGroupId = groupData.childGroup.id
    }
    switch(rule.approval) {
      case ApprovalType.NUMBER_MEMBER:
        rule.requiredUserNumber = rule.threshold;
        rule.requiredUsers = members;
        return rule;
      case ApprovalType.PERCENTAGE_MEMBER:
        var percent = rule.threshold/100.0;
        rule.requiredUserNumber = Math.ceil(percent*members.length);
        rule.requiredUsers = members;
        return rule;
      case ApprovalType.NUMBER_ADMIN:
        rule.requiredUserNumber = rule.threshold;
        rule.requiredUsers = admins;
        return rule;
      case ApprovalType.PERCENTAGE_ADMIN:
        var percent = rule.threshold/100.0;
        rule.requiredUserNumber = Math.ceil(percent*admins.length);
        rule.requiredUsers = admins;
        return rule;
      case ApprovalType.DECLINE:
        return rule;
    }
  };
  
  var getAdminsList = function(rule, groupData) {
    if (rule.side == CreditSide.EXTENDER) {
      return groupData.parentGroup.admins;
    } else {
      return groupData.childGroup.admins;
    }
  }
  
  var getMembersList = function(rule, groupData) {
    if (rule.side == CreditSide.EXTENDER) {
      return groupData.parentGroup.members;
    } else {
      return groupData.childGroup.members;
    }
  }
  
  var breakPriorityTie = function(rule1, rule2, groupData) {
    var rule1Members = getMembersList(rule1,groupData);
    var rule1Admins = getAdminsList(rule1, groupData);
    var rule2Members = getMembersList(rule2, groupData);
    var rule2Admins = getAdminsList(rule2, groupData);
    rule1 = getRequiredUsers(rule1, rule1Members, rule1Admins, groupData);
    rule2 = getRequiredUsers(rule2, rule2Members, rule2Admins, groupData);
    return rule1.requiredUsers.length > rule2.requiredUsers.length ? rule1 : rule2;
  };
  
  var getStrictestRule = function(rules, credit) {
     return new Promise(function(resolve, reject) {
       if (rules.length == 0) {
          resolve(null);
       } else {
        getGroupsDataPromise(credit)
          .then(function(groupData) {
            var strictestRule = rules[0];
            rules.forEach(function(rule) {
              if (ApprovalPriority[rule.approval] <
                  ApprovalPriority[strictestRule.approval]) {
                return;
              } else if (ApprovalPriority[rule.approval] >
                        ApprovalPriority[strictestRule.approval]) {
                strictestRule = rule;
                return;  
              } else {
                if (rule.approval == ApprovalType.DECLINE) {
                  return;
                }
                strictestRule = breakPriorityTie(rule,strictestRule,groupData);
                return;
              }
            });
            var memberList = getMembersList(strictestRule, groupData);
            var adminList = getAdminsList(strictestRule,groupData);
            strictestRule = getRequiredUsers(strictestRule, memberList, adminList, groupData);
            resolve(strictestRule);
          });
       }
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
  
  var processTransaction = function(transaction, cb) {
    if (transaction.status == 'APPROVED') {
      //SEND REIMBURSEMENT
      console.log("SENDING REIMBURSMENT");
      cb();
    } else if (transaction.status == 'DECLINED') {
      // Send push notification to user?
      cb();
    }
    var stateInfo = transaction.stateInfo;
    

    Credit.findById(stateInfo.currentState.CreditId).then(function(credit) {
      if (transaction.amount > credit.balance) {
        transaction
          .updateAttributes({
            status : 'DECLINED',
          })
          .then(function(transaction) {
            cb();
          })
      } else {
        var rulePromises = getRulePromises(transaction, credit);
        Promise.all(rulePromises)
          .then(function(rules) {
            var relevantRules = rules.filter(function(rule) {
              return (!rule.min || (rule.min <= rule.amount)) &&
                    (!rule.max || (rule.max > rule.amount));
            });
            var strictestRulePromise = getStrictestRule(relevantRules, credit);
            strictestRulePromise.then(function(approvalData) {
              if (!approvalData) {
                transaction.updateAttributes({
                  status: 'APPROVED'
                });
                //NO RELEVANT RULES -- SEND OUT REIMBURSEMENT
              } else {
                if (approvalData.approval == ApprovalType.DECLINE) {
                  // console.log("REIMBURSEMENT REQUEST DECLINED");
                  transaction
                    .updateAttributes({
                      status : 'DECLINED'
                      //SET MESSAGE TO RULE INFO
                    })
                  //DECLINE AND NOTIFY TRANSACTION REQUESTER
                } else {
                  //We can't require more users to sign off than exist in the group
                  if (approvalData.requiredUserNumber > approvalData.requiredUsers.length) {
                    approvalData.requiredUserNumber = approvalData.requiredUsers.length;
                  }
                  var updatedState = transaction.stateInfo;
                  updatedState.currentState.currentRule = approvalData;
                  transaction.stateInfo = updatedState;
                  var state = JSON.parse(JSON.stringify(updatedState));
                  
                  transaction.updateAttributes({
                    stateInfo : updatedState
                  })
                  var userIds = transaction.stateInfo.currentState.currentRule.requiredUsers;
                  userIds.forEach(function(userId){
                    createApproval(transaction, userId);
                  });
                }
              }
              cb();
            });
          })
          .catch(function(err) {
            console.log(err);
            cb();
          });
      }
    }).catch(function(err) {
      console.log(err);
      cb();
    });
  };
  
  Transaction.afterCreate(function(transaction, options, cb) {
    processTransaction(transaction, cb);
    if (transaction.status == 'PENDING') {
        updateCredit(transaction, true)
          .then(function(credit) {
            cb();
          })
    } else {
      cb();
    }
  });
  
  Transaction.afterUpdate(  function(transaction, options, cb) {
    //If current rule info is set, then we don't need to
    //process again. We're waiting on approvals.
    var stateInfo = transaction.stateInfo;
    if (stateInfo.currentState.currentRule != null
        || transaction.status == 'APPROVED') {
      cb();
    } else {
      processTransaction(transaction, cb);
      cb();
    }
  })
};