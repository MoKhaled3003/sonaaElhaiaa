'use strict';
module.exports = (sequelize, DataTypes) => {
  const Governorate = sequelize.define('Governorate', {
    name: DataTypes.STRING,
    ar_name: DataTypes.STRING,
    code: DataTypes.STRING(2)
  }, {
    underscored: true
  });
  Governorate.associate = function(models) {
    // associations can be defined here
  };
  return Governorate;
};