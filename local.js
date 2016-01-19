var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('<html><h1>Hello!</h1></html>');
});

app.listen(3000);
