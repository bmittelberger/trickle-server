var models = require('./models'),
    config = require('./config.json'),
    utils = require('./utils')(models, config),
    Transaction = models.Transaction,
    transactionUtils = utils.transaction,
    api = require('./api/v0');

var UserGroup = models.UserGroup;
var Group = models.Group;
var Credit = models.Credit;
var Organization = models.Organization;
var User = models.User;
var UserOrganization = models.UserOrganization;
var Promise = models.sequelize.Promise;
var Transaction = models.Transaction;
var Approval = models.Approval;

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
      isAdmin : isAdmin === true
    }).then(function(userGroup) {
      resolve(userGroup)
    })
  })
};

var addUserToOrg = function(OrgId, UserId, isAdmin) {
    return new Promise(function(resolve, reject) {
      UserOrganization
      .create({
        UserId : UserId,
        OrganizationId : OrgId,
        isAdmin : isAdmin === true
      }).then(function(userOrganization) {
        resolve(userOrganization)
      })
    });
};

var addGroup = function(name, description, ParentGroupId, OrganizationId) {
  return new Promise(function(resolve, reject) {
     Group.create({
      name : name,
      description : description,
      ParentGroupId : ParentGroupId,
      OrganizationId : OrganizationId
    }).then(function(group) {
      resolve(group)
    });
  });
};

var addUser = function(first, last, email, password) {
  return new Promise(function(resolve, reject) {
    User.create({
      first: first,
      last: last,
      email : email,
      password: password
    })
    .then(function(user) {
      resolve(user);
    });
  });
};

var createCredit = function (amount, description, GroupId, rules) {
  return new Promise(function(resolve, reject) {
    Credit
			.create({
				amount : amount,
				balance : amount,
				description : description,
				GroupId : GroupId,
				rules : rules
      })
      .then(function(credit) {
        resolve(credit);
      });
  });
};


var createRule = function(type, min, max, window, threshold, approval) {
  rule = {};
  rule.type = type;
  rule.min = min;
  if (max) {
    rule.max = max;
  }
  if (window) {
    rule.window = window;
  }
  if (threshold) {
    rule.threshold = threshold;
  }
  rule.approval = approval;
  return rule;
}

var addOrg = function(name, description) { 
  return new Promise(function(resolve, reject) {
    Organization.create({
      name: name,
      description: description
    }).then(function(organization){
      resolve(organization);
    })
  });
}


var addEquipment = function(team, amount) {
  rules = [];
  rules.push(createRule(RuleType.RANGE_APPROVAL,20,100,null,2,ApprovalType.NUMBER_MEMBER));
  rules.push(createRule(RuleType.RANGE_APPROVAL,100,200,null,1,ApprovalType.NUMBER_ADMIN));
  rules.push(createRule(RuleType.WINDOW_LIMIT,400,null,Window.WEEK,null,ApprovalType.DECLINE));
  createCredit(amount,"Equipment (Shoes, Balls, etc..)",team.id,JSON.parse(JSON.stringify(rules)))
}

var addFood = function(team, amount) {
  rules = [];
  rules.push(createRule(RuleType.RANGE_APPROVAL,0,50,null,1,ApprovalType.NUMBER_MEMBER));
  rules.push(createRule(RuleType.RANGE_APPROVAL,50,null,null,null,ApprovalType.DECLINE));
  createCredit(amount,"Halftime Snacks!",team.id,JSON.parse(JSON.stringify(rules)));
}

var addOfficeSupplies = function(team, amount) {
  rules = []
  createCredit(amount,"Office Supplies",team.id,JSON.parse(JSON.stringify(rules)));
};

var addTeam1 = function(group,organization,seppBlatter) {
  var ronaldo = addUser("Christiano","Ronaldo","ronaldo@madrid.com","a");
  var messi = addUser("Leonel","Messi","messi@barca.com","a")
  Promise.all([ronaldo,messi]).then(function(users){
    var groupPromise = addGroup("Team Blue","From East Campus",group.id,organization.id);
    groupPromise.then(function(teamBlue) {
      addUserToGroup(teamBlue.id,seppBlatter.id,true);
      users.forEach(function(user) {
        addUserToOrg(organization.id,user.id,false);
        addUserToGroup(teamBlue.id,user.id,false);
      });
      addEquipment(teamBlue,1000)
      addFood(teamBlue,300)
    });
  })
}

var addTeam2 = function(group,organization,seppBlatter) {
  var groupPromise = addGroup("Team Red","From West Campus",group.id,organization.id);
  groupPromise.then(function(teamRed) {
    addUserToGroup(teamRed.id,seppBlatter.id,true);
    addEquipment(teamRed,800);
  });
}

// var clearDB = function() {
//   return new Promise(function(resolve, reject) {
//     Transaction.destroy({where: {id : {$lt : 10000000}}})
//     .then(function(transactions) {User.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(users) {Approval.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(approvals) {Group.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(groups) {Organization.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(organizations) {Credit.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(credits) {UserOrganization.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(userOrgs) {UserGroup.destroy({where: {id : {$lt : 10000000}}})})
//     .then(function(userGroups){ resolve (userGroups)});
//   });
// };



// clearDB.then(function(userGroups){ 
var orgPromise = addOrg("PeeWee's Soccer League","The greatest league in Palo Alto")
orgPromise.then(function(organization) {
    addUser("Sepp","Blatter","corrupt@fifa.com","a").then(function(sepp) {
      addGroup("Teams","Teams in the league.", null, organization.id)
      .then(function(teamsGroup) {
        addUserToOrg(organization.id,sepp.id,true);
        addUserToGroup(teamsGroup.id,sepp.id,true);
        addTeam1(teamsGroup, organization, sepp);
        addTeam2(teamsGroup, organization, sepp);
      });
      addGroup("Administrative","Administrative Members of League",null,organization.id)
      .then(function(administrative) {
        addUserToGroup(administrative.id,sepp.id,true)
        addOfficeSupplies(administrative,500);
      })
    })
});
// });