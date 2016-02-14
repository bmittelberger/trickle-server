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
  });
};