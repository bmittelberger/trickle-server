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

var models = [
  'Organization',
  'Group',
  'User',
  'Transaction',
  'Rule',
  'Credit'
];
models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

var relations = [
  'UserOrganization',
  'UserGroup'
];
relations.forEach(function(relation) {
  module.exports[relation] = sequelize.import(__dirname + '/relations/' + relation);
});

(function(m) {
  m.Organization.hasOne(m.Group);
  m.Organization.belongsToMany(m.User, {through: m.UserOrganization});
  
  m.Group.belongsTo(m.Group);
  m.Group.belongsTo(m.Organization);
  m.Group.belongsToMany(m.User, {through: m.UserGroup});
  
  m.User.belongsToMany(m.Organization, {through: m.UserOrganization});
  m.User.belongsToMany(m.Group, {through: m.UserGroup});
  
  m.Transaction.belongsTo(m.User);
  m.Transaction.belongsTo(m.Group);
  
  m.Credit.belongsTo(m.Group);
  
  m.Rule.belongsTo(m.Credit);
})(module.exports);

module.exports.sequelize = sequelize;