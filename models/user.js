const Joi = require("joi");
const jwt = require('jsonwebtoken');

'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_damen_staff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_mk_staff: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }

  }, {
    underscored: true
  });
  User.associate = function(models) {
    // associations can be defined here
  };

  User.prototype.generateAuthToken = function() {
    const token = jwt.sign({ 
      id: this.id , 
      email: this.email, 
      is_admin: this.is_admin,
      is_damen_staff: this.is_damen_staff,
      is_mk_staff: this.is_mk_staff
     },'1234');
    return token;
  };

  return User;
};


module.exports.UserValidationSchema = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(32),
  is_admin: Joi.boolean().optional(),
  is_damen_staff: Joi.boolean().optional(),
  is_mk_staff: Joi.boolean().optional()
});

module.exports.LoginValidationSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});


function validateUser(user) {
  const schema = {
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    is_admin: Joi.boolean().optional(),
    is_damen_staff: Joi.boolean().optional(),
    is_mk_staff: Joi.boolean().optional()
  };

  return Joi.validate(user, schema);
};

function validatePassword(user) {
  const schema = {
    oldPassword: Joi.string().min(5).max(255).required(),
    newPassword: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(user, schema);
};

module.exports.validate = validateUser;
module.exports.validatePassword = validatePassword;