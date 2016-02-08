var auth = require('./auth.js'),
    transaction = require('./transaction.js');

module.exports = function(models, config) {
  return {
    auth: auth(models, config),
    transaction: transaction(models, config)
  };
};