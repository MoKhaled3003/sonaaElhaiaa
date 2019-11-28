const auth = require('../middleware/auth');
const Beneficiary = require("../models/index")["Beneficiary"];
const Merchant = require("../models/index")["Merchant"];
const Category = require("../models/index")["Category"];
const DamenMerchant = require("../models/index")["DamenMerchant"];
const Deposit = require("../models/index")["Deposit"];
const Transaction = require("../models/index")["Transaction"];
const Account = require("../models/index")["Account"];
const express = require('express');
const paginate = require('express-paginate');
const router = express.Router();


router.get('/', auth, async (req, res) => {
  const gov_id = req.query.gov_id;
  let whereOptions = {};
  if (gov_id) whereOptions['gov_id'] =  gov_id;
  const results = await Beneficiary.findAndCountAll({
    where: whereOptions,
    limit: req.query.limit, 
    offset: req.skip,
    include: [{model: Account},{model: Category},{model: DamenMerchant}]
  });
  
    const itemCount = results.count;
    const pageCount = Math.ceil(results.count / req.query.limit);

    res.json({
      data: results.rows,
      pageCount,
      itemCount,
      has_more: paginate.hasNextPages(req)(pageCount)
    });
  
});


router.get('/:id/deposits', auth, async (req, res) => {
  const benef = await Beneficiary.findByPk(req.params.id);

  if (!benef) return res.status(404).send('beneficiary is not found.');
  deposits = await Deposit.findAll({ where: {account_id : benef.account_id }})
 
  res.send(deposits);
});


router.get('/:id/transactions', auth, async (req, res) => {
  const benef = await Beneficiary.findByPk(req.params.id);

  if (!benef) return res.status(404).send('beneficiary is not found.');
  transactions = await Transaction.findAll({ where: {account_id : benef.account_id }})
 
  res.send(transactions);
});



router.get('/:id/balance', auth, async (req, res) => {
  const benef = await Beneficiary.findByPk(req.params.id);

  if (!benef) return res.status(404).send('beneficiary is not found.');
  account = await Account.findByPk(benef.account_id)
 
  res.json({beneficiary_id: benef.id , balance: account.balance});
});

router.get('/:id', auth, async (req, res) => {
  const benef = await Beneficiary.findOne({
    where: {id: req.params.id},
    include: [{model: Merchant}]
  });

  if (!benef) return res.status(404).send('beneficiary is not found.');

  res.send(benef);
});

module.exports = router; 