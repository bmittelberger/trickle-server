/* global __dirname */

var Sequelize = require('sequelize');

var sequelize = new Sequelize(
  'trickle',
  'kab',
  'kevinadamben',
  {
    host: 'tricklemain.cilp42hilpk6.us-west-2.rds.amazonaws.com',
    port: '5432',
    dialect: 'postgres'
  }
);

module.exports.sequelize = sequelize;

// Custom addition to sequelize. Provides late-binding for instance methods
// within models.
var bindMethodFn = function(model, name, method) {
  model.Instance.prototype[name] = method;
};

var models = [
  'Organization',
  'Group',
  'User',
  'Transaction',
  'Credit',
  'Approval'
];
models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

var relations = [
  'UserOrganization',
  'UserGroup'
];
relations.forEach(function(relation) {
  module.exports[relation] = sequelize.import(__dirname + '/relations/' +
                                              relation);
});

(function(m) {
  m.Organization.hasOne(m.Group);
  m.Organization.belongsToMany(m.User, {through: m.UserOrganization});
  
  m.Group.belongsTo(m.Group, {foreignKey : 'ParentGroupId'});
  m.Group.belongsTo(m.Organization);
  m.Group.belongsToMany(m.User, {through: m.UserGroup});
  m.Group.hasMany(m.Credit);
  
  m.User.belongsToMany(m.Organization, {through: m.UserOrganization});
  m.User.belongsToMany(m.Group, {through: m.UserGroup});
  
  m.Transaction.belongsTo(m.User);
  m.Transaction.belongsTo(m.Group);
  m.Transaction.belongsTo(m.Credit);
  
  m.Credit.belongsTo(m.Credit, {foreignKey : 'ParentCreditId'});
  m.Credit.belongsTo(m.Group);
  
  m.Approval.belongsTo(m.User);
  m.Approval.belongsTo(m.Transaction);
  m.Approval.belongsTo(m.Credit);
  
  // Bind hooks to models
  models.forEach(function(model) {
    var hookBindingFn = require('./hooks/' + model.toLowerCase() + '.js');
    hookBindingFn(m);
  });

  // Bind instance methods to models
  models.forEach(function(model) {
    var methodBindingFn = require('./methods/' + model.toLowerCase() + '.js');
    methodBindingFn(m, bindMethodFn);
  });
  
})(module.exports);