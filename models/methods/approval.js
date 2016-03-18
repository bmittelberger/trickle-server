var notificationUtils = require('../../utils/notification.js'),
    numeral = require('numeral');

module.exports = function(models, bindMethodFn) {
  var User = models.User; 
  var Approval = models.Approval;
  var Promise = models.sequelize.Promise;
  
  bindMethodFn(Approval, 'sendNotification', function() {
    console.log("sending notification!");
    var approval = this;
    Promise
      .all([
        this.getUser(),
        this.getTransaction({
          include: [User]
        }),
        Approval.count({
          where: {
            'UserId': approval.UserId,
            'status': 'ACTIVE'
          }
        })
      ])
      .then(function(results) {
        var user = results[0],
            transaction = results[1],
            numPendingApprovals = results[2];
        var device = new notificationUtils.apn.Device(user.device);       
        var amount = numeral(transaction.amount).format('$0,0.00');

        var notification = new notificationUtils.apn.Notification();
        notification.expiry = Math.floor(Date.now() / 1000) + 3600;
        notification.badge = numPendingApprovals;
        notification.sound = "ping.aiff";
        notification.alert = transaction.User.first + ' ' + transaction.User.last + ' spent ' + amount + ' - ' + transaction.title + '.';
        notification.contentAvailable = false;

        notificationUtils.connection.pushNotification(notification, device);
      });
  });
};