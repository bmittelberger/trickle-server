var models = require('../models'),
    Organization = models.Organization,
    Group = models.Group,
    User = models.User,
    Transaction = models.Transaction,
    Credit = models.Credit,
    UserOrganization = models.UserOrganization,
    UserGroup = models.UserGroup,
    Approval = models.Approval;

models.sequelize.sync({
	force: true
});

// Organization.sync()

// .then(function() {
//   return Group.sync();
// })

// .then(function() {
//   return User.sync();
// })

// .then(function() {
//   return Transaction.sync();
// })

// .then(function() {
//   return Credit.sync();
// })

// .then(function() {
//   return Approval.sync();
// })

// .then(function() {
//   return UserOrganization.sync();
// })

// .then(function() {
//   return UserGroup.sync();
// });