var auth = require('./auth.js'),
    venmo = require('./venmo.js')

module.exports = function(models, config) {
  return {
    auth: auth(models, config),
    venmo: venmo
  };
};