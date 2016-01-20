var express = require('express'),
    api = express.Router(),
    v0 = require('./v0');

module.exports = function(config) {
  api.use('/v0', v0(config));
  
  api.all('/', function(req, res) {
    res.redirect(config.apiRoot + '/v0');
  });
  
  return api;
};