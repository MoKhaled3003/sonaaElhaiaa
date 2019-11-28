'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('beneficiaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      nid: {
        type: Sequelize.STRING(14),
        unique: true
      },
      gov_id: {
        type: Sequelize.INTEGER
      },
      town: {
        type: Sequelize.STRING
      },
      village: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      service_type: {
        type: Sequelize.STRING
      },
      beneficiary_status: {
        type: Sequelize.STRING
      },
      account_id: {
        type: Sequelize.STRING(12)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      category_id: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('beneficiaries');
  }
};