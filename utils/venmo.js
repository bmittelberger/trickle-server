var request = require('request'),
    Promise = require('sequelize').Promise,
    config = require('../config.json'),
    VENMO_API_ROOT = 'https://api.venmo.com/v1/';

var demoReducer = function(amount) {
  if (amount > 100) {
    return demoReducer(amount / 10);
  }
  
  return Math.round(amount) / 100;
};

var reimburse = function(transaction) {
  return new Promise(function(resolve, reject) {
    var userPromise = transaction.getUser(),
        groupPromise = transaction.getGroup();
    
    Promise.all([userPromise, groupPromise])
      .then(function(txInfo) {
        var user = txInfo[0],
            group = txInfo[1];

        group.getOrganization()
          .then(function(organization) {

            request.post({
              url: VENMO_API_ROOT + 'payments',
              form: {
                access_token: organization.venmo.access_token,
                phone: user.venmo.phone,
                note: transaction.description + (transaction.message ? ' - ' + transaction.message : ''),
                amount: demoReducer(transaction.amount),
                // amount: transaction.amount,
                audience: 'private'
              }
            }, function(err, res, body) {
              if (err) {
                console.log(err);
                return reject(err);
              }

              var json = JSON.parse(body);
              if (json.error) {
                return reject(json);
              }
              resolve(json);
            });
          })
          .catch(function(err) {
            reject(err);
          });
      })
      .catch(function(err) {
        reject(err);
      });
  });
};
  
module.exports = {
  reimburse: reimburse
};