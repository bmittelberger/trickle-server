var models = require('./models'),
    config = require('./config.json'),
    utils = require('./utils')(models, config),
    Transaction = models.Transaction,
    transactionUtils = utils.transaction,
    api = require('./api/v0'),

var UserGroup = models.UserGroup;
var Group = models.Group;
var Credit = models.Credit;
var Organization = models.Organization;
var User = models.User;
    
var RuleType = {
  WINDOW_LIMIT: 'RULE_TYPE_WINDOW_LIMIT',
  RANGE_APPROVAL: 'RULE_TYPE_RANGE_APPROVAL'
};

var Window = {
  DAY: 'WINDOW_DAY',
  WEEK: 'WINDOW_WEEK',
  MONTH: 'WINDOW_MONTH'
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
    
var addUserToGroup = function(GroupId, UserId, isAdmin) {
  return new Promise(function(resolve, reject) {
    UserGroup
    .create({
      UserId : UserId,
      GroupId : GroupId,
      isAdmin : isAdmin === 'true'
    }).then(function(userGroup) {
      resolve(userGroup)
    })
  })
};

var addUserToOrg = function(orgId, userId, isAdmin) {
    UserOrganization
      .create({
        UserId : UserId,
        GroupId : GroupId,
        isAdmin : isAdmin === 'true'
      })
};

var addGroup = function(name, description, parentGroupId, OrganizationId) {
  Group.create({
    name : name,
    description : description,
    parentGroupId : parentGroupId,
    OrganizationId : OrganizationId
  }).then(function(group) {
    return group
  });
};

var addUser = function(first, last, email, password) {
  User.create({
    first: first,
    last: last,
    email : email,
    password: password
  })
  .then(function(user) {
    return user;
  });
};

var createCredit = function (amount, description, GroupId, rules) {
  Credit
			.create({
				amount : amount,
				balance : amount,
				description : description,
				GroupId : GroupId,
				rules : rules
      })
      .then(function(credit) {
        return credit;
      });
};

var addOrg = function(name, description) { 
  Organization.create({
    name: name,
    
  })
}