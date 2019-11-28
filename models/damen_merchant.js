'use strict';
module.exports = (sequelize, DataTypes) => {
  const DamenMerchant = sequelize.define('DamenMerchant', {
    merchant_code: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    merchant_name: DataTypes.STRING,
    place_name: DataTypes.STRING,
    mobile_number: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    national_id: DataTypes.STRING,
    commercial_register: DataTypes.STRING,
    building_number: DataTypes.STRING,
    street_name: DataTypes.STRING,
    district_name: DataTypes.STRING,
    pos_serial: DataTypes.STRING,
    gov_code: DataTypes.INTEGER
  }, {
    underscored: true,
    freezeTableName: true,
    tableName: 'damen_merchants_vw'
  });
  DamenMerchant.associate = function(models) {
    //Merchant.hasMany(models.Beneficiary);
  };
  return DamenMerchant;
};