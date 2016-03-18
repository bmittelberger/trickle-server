var notificationUtils = require('../../utils/notification.js'),
    numeral = require('numeral');

module.exports = function(models, bindMethodFn) {
  var User = models.User; 
  var Approval = models.Approval;
  var Promise = models.sequelize.Promise;
  var Transaction = models.Transaction;
  
  bindMethodFn(Transaction, 'sendNotification', function() {
    console.log("sending notification!");
    var transaction = this;
    this.getUser()
      .then(function(user) {
        var device = new notificationUtils.apn.Device(user.device);       
        var amount = numeral(transaction.amount).format('$0,0.00');

        var notification = new notificationUtils.apn.Notification();
        notification.expiry = Math.floor(Date.now() / 1000) + 3600;
        notification.sound = "ping.aiff";
        notification.alert = 'Your reimbursement request was ' + (transaction.status == "APPROVED" ? 'approved' : 'declined') + '. - ' + transaction.title;
        notification.contentAvailable = false;

        notificationUtils.connection.pushNotification(notification, device);
      });
  });
};