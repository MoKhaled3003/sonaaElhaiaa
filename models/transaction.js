'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    account_id: DataTypes.STRING(12),
    merchant_id: DataTypes.STRING(6),
    amount: DataTypes.DOUBLE,
    notes: DataTypes.TEXT
  }, {
    underscored: true
  });
  Transaction.associate = function(models) {
    // associations can be defined here
  };
  return Transaction;
};