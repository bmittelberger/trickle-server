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
    }
  });
};