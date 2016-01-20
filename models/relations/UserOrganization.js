module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserOrganization', {
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};