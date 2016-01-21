var auth = require('./auth.js');

module.exports = function(models, config) {
  return {
    auth: auth(models, config)
  };
};