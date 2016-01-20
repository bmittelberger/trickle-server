module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Credit', {
    amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2)
    },
    description: {
      type: DataTypes.STRING
    }
  });
};