var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
    
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    first: {
      type: DataTypes.STRING
    },
    last: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: {
          msg: 'Invalid email address.'
        }
      },
      unique: true
    },
    password: {
      type: DataTypes.STRING
    },
    venmo: {
      type: DataTypes.JSON
    },
    device : {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      afterValidate: function(user, options, cb) {
        if (!user.changed('password'))
          return cb(null, user);
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
          if (err)
            return cb(err);
          bcrypt.hash(user.password, salt, function(err, hash) {
            if (err)
              return cb(err);
            user.password = hash;
            cb(null, user);
          });
        });
      }
    },
    instanceMethods: {
      authenticate: function(password, cb) {
        bcrypt.compare(password, this.password, function(err, isMatch) {
          if (err)
            return cb(err);
          cb(null, isMatch);
        });
      },
      toJSON: function() {
        var values = this.get(),
            copy = {};
        for (var i in values)
          copy[i] = values[i];
        delete copy.password;
        return copy;
      }
    }
  });

  return User;
};