var apn = require('apn'),
    connection = new apn.Connection({});
    
module.exports = {
  apn: apn,
  connection: connection
};