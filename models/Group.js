module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Group', {
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    }
  });
};