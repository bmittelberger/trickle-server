var express = require('express'),
    app = express(),
    config = require('./config.json'),
    api = require('./api');

app.use('/api', api(config));

app.all('/', function(req, res) {
  res.redirect(config.apiRoot);
});

app.listen(config.production ? config.productionPort : config.devPort);