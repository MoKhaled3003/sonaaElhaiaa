const Joi = require("joi");

'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    label: DataTypes.STRING,
    ordering: DataTypes.INTEGER
  }, {
    underscored: true
  });
  Category.associate = function(models) {
    // associations can be defined here
  };
  return Category;
};


function validateCategory(category) {
  const schema = {
    label: Joi.string().required()
  };

  return Joi.validate(category, schema);
};

module.exports.validate = validateCategory;