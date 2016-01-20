module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserGroup', {
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};