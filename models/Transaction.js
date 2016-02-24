module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Transaction', {
    amount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    title: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING
    },
    location: {
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
  }, {
    instanceMethods: {
      toJSON: function() {
        var values = this.get(),
            copy = {};
        for (var i in values)
          copy[i] = values[i];
        if (copy.User) {
          copy.User = copy.User.toJSON();
        }
        return copy;
      }
    }
  });
};