var express = require('express'),
    api = express.Router(),
    v0 = require('./v0');

module.exports = function(models, config, utils) {
  api.use('/v0', v0(models, config, utils));
  
  api.all('/', function(req, res) {
    res.redirect(config.apiRoot + '/v0');
  });
  
  return api;
};