var auth = require('./auth.js'),
    transaction = require('./transaction.js'),
    venmo = require('./venmo.js'),
    approval = require('./approval.js');

module.exports = function(models, config) {
  return {
    auth: auth(models, config),
    transaction: transaction(models, config),
    approval: approval,
    venmo: venmo
  };
};