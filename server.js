var express = require('express'),
    app = express(),
    models = require('./models'),
    config = require('./config.json'),
    utils = require('./utils')(models, config),
    api = require('./api'),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use('/api', api(models, config, utils));

app.all('/', function(req, res) {
  res.redirect(config.apiRoot);
});

app.listen(config.production ? config.productionPort : config.devPort);