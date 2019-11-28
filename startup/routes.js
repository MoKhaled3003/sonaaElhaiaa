const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const auth = require('../routes/auth');
const users = require('../routes/users');
const governorates = require('../routes/governorates');
const beneficiaries = require('../routes/beneficiaries');
const transactions = require('../routes/transactions');
const deposits = require('../routes/deposits');
const categories = require('../routes/categories');
const merchants = require('../routes/merchants');
const income_gen = require('../routes/income_gen');
const data = require('../routes/data');
const error = require('../middleware/error');
const paginate = require('express-paginate');
const i18n = require("i18n");


i18n.configure({
  locales:['ar', 'en'],
  directory: __dirname + '/locales',
  defaultLocale: 'ar',
});

module.exports = function(app) {
  app.use(express.json());
  app.use(cors());
  app.use(fileUpload());
  app.use(paginate.middleware(20, 100));
  app.use('/api/users', users);
  app.use('/api/income-generation', income_gen);
  app.use('/api/governorates', governorates);
  app.use('/api/beneficiaries', beneficiaries);
  app.use('/api/transactions', transactions);
  app.use('/api/deposits', deposits);
  app.use('/api/merchants', merchants);
  app.use('/api/categories', categories);
  app.use('/api/data', data);
  app.use('/api/auth', auth);
  app.use(error);
}