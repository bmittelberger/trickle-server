module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Rule', {
    type: {
      type: DataTypes.ENUM(
        'LESS_THAN'
      )
    },
    data: {
      type: DataTypes.JSON
    }
  });
};