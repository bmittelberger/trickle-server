var request = require('request'),
    VENMO_API_ROOT = 'https://api.venmo.com/v1/';

module.exports = function(models, config) {
  var Promise = models.sequelize.Promise;
  
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
                  audience: 'private'
                }
              }, function(err, res, body) {
                if (err) {
                  return reject(err);
                }
             
                resolve(JSON.parse(body));
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
  
  return {
    reimburse: reimburse
  };
};