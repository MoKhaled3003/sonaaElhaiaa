'use strict';
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    pin: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    balance: DataTypes.DOUBLE
  }, {
    underscored: true,
    hooks:{
      beforeCreate:(acc)=>{
        pinstring = (Math.floor((Math.random() * 9999999999) + 1)).toString();
        acc.pin = (pinstring.substring(1,7)).parseInt();
      }
    }
  });
  Account.associate = function(models) {
    Account.belongsTo(models.Beneficiary, {foreignKey: 'id', targetKey: 'account_id'});
    Account.hasMany(models.Deposit);
  };
  
  return Account;
};