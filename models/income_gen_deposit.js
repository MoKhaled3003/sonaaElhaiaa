'use strict';
module.exports = (sequelize, DataTypes) => {
  const IncomeGenerationDeposit = sequelize.define('IncomeGenerationDeposit', {
    income_gen_ben_id: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,
    notes: DataTypes.TEXT
  }, {
    underscored: true
  });
  IncomeGenerationDeposit.associate = function(models) {

   IncomeGenerationDeposit.belongsTo(models.IncomeGenerationBeneficiary, {foreignKey: 'income_gen_ben_id'});
  };
  return IncomeGenerationDeposit;
};