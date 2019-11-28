'use strict';
module.exports = (sequelize, DataTypes) => {
  const Beneficiary = sequelize.define('Beneficiary', {
    name: DataTypes.STRING,
    nid: {
      type: DataTypes.STRING(14),
      unique: true
    },
    gov_id: DataTypes.INTEGER,
    town: DataTypes.STRING,
    village: DataTypes.STRING,
    gender: DataTypes.STRING,
    service_type: DataTypes.STRING,
    beneficiary_status: DataTypes.STRING,
    account_id: DataTypes.STRING(12),
    category_id: DataTypes.INTEGER
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
  Beneficiary.associate = function(models) {
    Beneficiary.belongsTo(models.Merchant);
    Beneficiary.belongsTo(models.Category);
    Beneficiary.belongsTo(models.DamenMerchant);
    Beneficiary.belongsTo(models.Account);
  };
  Beneficiary.prototype.generateAccountId = function() {
    const account_id = `101${this.gov_id.toString().padStart(2, '0')}${this.id.toString().padStart(7, '0')}`;
    return account_id;
  };
  return Beneficiary;
};