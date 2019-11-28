'use strict';
module.exports = (sequelize, DataTypes) => {
  const Deposit = sequelize.define('Deposit', {
    account_id: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    notes: DataTypes.TEXT,
    is_reset: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    underscored: true
  });
  Deposit.associate = function(models) {
    // associations can be defined here
    Deposit.belongsTo(models.Account);
   // Deposit.belongsTo(models.Beneficiary,{foreignKey: 'account_id'});
    Deposit.belongsTo(models.Beneficiary, {foreignKey: 'account_id', targetKey: 'account_id'});
  };
  return Deposit;
};