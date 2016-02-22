var venmoUtils = require('../utils/venmo.js');
    
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Approval', {
    status: {
      type: DataTypes.ENUM(
        'ACTIVE',
        'APPROVED',
        'DECLINED',
        'EXPIRED'
      )
    },
    message: {
      type: DataTypes.STRING
    }
  }, {
    instanceMethods: {
      toJSON: function() {
        var values = this.get(),
            copy = {};
        for (var i in values)
          copy[i] = values[i];
        if (copy.Transaction) {
          copy.Transaction = copy.Transaction.toJSON();
        }
        return copy;
      }
    }
  });
};