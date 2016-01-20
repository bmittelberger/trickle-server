module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Organization', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    venmo: {
      type: DataTypes.JSON
    }
  });
};