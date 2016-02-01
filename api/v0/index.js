var express = require('express'),
    api = express.Router(),
    authentication = require('./authentication.js'),
    users = require('./users.js'),
    organizations = require('./organizations.js');
    groups = require('./groups.js');
    credits = require('./credits.js');

module.exports = function(models, config, utils) {
  
  api.use('/authentication', authentication(models, config, utils));
  
  api.use('/users', users(models, config, utils));

  api.use('/organizations', organizations(models, config, utils));

  api.use('/groups', groups(models, config, utils));

  api.use('/credits', credits(models, config, utils));
  
  api.all('/', function(req, res) {
    res.send('Trickle API v0.');
  });
  
  return api;
};