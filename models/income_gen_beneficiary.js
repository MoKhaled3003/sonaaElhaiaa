'use strict';
module.exports = (sequelize, DataTypes) => {
  const IncomeGenerationBeneficiary = sequelize.define('IncomeGenerationBeneficiary', {
    name: DataTypes.STRING,
    nid: {
      type: DataTypes.STRING(14),
      unique: true
    },
    gov: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    notes: DataTypes.TEXT
    
  }, {
    underscored: true,
    hooks: {
      beforeValidate: () => {
    
      },
      afterValidate: () => {
       
      },
      beforeCreate: (ben) => {
      
      
      },
      afterCreate: async(ben) => {
      
      }
    } 
  });
  return IncomeGenerationBeneficiary;
};