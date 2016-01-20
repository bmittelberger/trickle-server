var express = require('express'),
    api = express.Router();

module.exports = function(config) {
  api.all('/', function(req, res) {
    res.send('Trickle API v0.');
  });
  
  return api;
};