'use strict';
module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define('Merchant', {
    damen_id: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN
  }, {
    underscored: true,
    hooks: {
      
      beforeCreate: (m) => {
        console.log('before merchant create');
        m.id = m.damen_id.toString().padStart(6, '0');
      }
    } 
  });
  Merchant.associate = function(models) {
    Merchant.hasMany(models.Beneficiary);
    Merchant.belongsTo(models.DamenMerchant, {foreignKey: 'damen_id'});
  };
  return Merchant;
};