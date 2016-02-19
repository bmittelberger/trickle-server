module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Transaction', {
    amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    description: {
      type: DataTypes.STRING
    },
    message: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING',
        'APPROVED',
        'DECLINED'
      )
    },
    processedAt: {
      type: DataTypes.DATE,
    },
    stateInfo: {
      type: DataTypes.JSON
    }
  });
};