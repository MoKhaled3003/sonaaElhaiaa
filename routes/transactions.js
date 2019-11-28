const auth = require('../middleware/auth');
const Beneficiary = require("../models/index")["Beneficiary"];
const Merchant = require("../models/index")["Merchant"];
const Transaction = require("../models/index")["Transaction"];
const Account = require("../models/index")["Account"];
const express = require('express');
const paginate = require('express-paginate');
const sequelize = require("../models/index").sequelize;
const Joi = require("joi");
const moment = require('moment');
const __ = require("i18n").__;
const router = express.Router();



router.post('/account_balance', auth, async (req, res) => {
  const { error } = validateBalanceCheck(req.body); 
  if (error) return res.status(400).send(__("invalid_data"));
 
  const account_id = req.body.account_id;


  let account = await Account.findOne({where: { id: account_id }});
  if (! account) return res.status(404).send(__('Account is not found'));
   
    res.json({ balance: account.balance});
  });


router.get('/', auth, async (req, res) => {
  const results = await Transaction.findAndCountAll({
    limit: req.query.limit, 
    offset: req.skip
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


router.post('/', auth, async (req, res) => {
    console.log("==============");
    const { error } = validateTransaction(req.body); 
    if (error) return res.status(400).send(__("invalid_data"));
    const amount = req.body.amount;
    const account_id = req.body.account_id;
    const merchant_id = req.body.merchant_id;
  

    let transaction;  
    try {
      transaction = await sequelize.transaction();
      let account = await Account.findOne({where: { id: account_id }, transaction, lock: transaction.LOCK.UPDATE});
      if (! account) return res.status(400).send(__('Account is not found'));

      let merchant = await Merchant.findOne({where: { id: merchant_id }});
      if (! merchant) return res.status(400).send(__('Merchant is not found'));


      let ben = await Beneficiary.findOne({where: { account_id: account_id }});
      if (ben.merchant_id != merchant_id) return res.status(400).send(
        __("Beneficiary is not in merchant's list"));

      if ( amount > account.balance)  return res.status(400).send(
        __('Balance is not sufficient'));

      const t = await Transaction.create({ 
          account_id: account_id,
          merchant_id: merchant_id,
          amount: amount,
          notes: ''
        },{transaction});

    

      account.balance -= amount
      await account.save({fields: ['balance'],transaction});
      await transaction.commit();
      let d = moment(t.createdAt)
      res.json({ 
        transaction_id : t.id, 
        account_id: account.id, 
        transaction_amount: t.amount,
        balance: account.balance,
        merchant_code: merchant.id,
        beneficiary: ben.name,
        transaction_date: d.format('DD-MM-YYYY'),
        transaction_time: d.format('HH:mm:ss')

      });

  } catch (err) {
    // Rollback transaction only if the transaction object is defined
    console.log(err);
    if (transaction) await transaction.rollback();
    return res.status(500).send(__('Transaction is not completed'));
  }
    
  });


  function validateTransaction(transaction) {
    const schema = {
      account_id: Joi.string().min(12).max(12).required(),
      inside_code: Joi.string().required(),
      merchant_id: Joi.string().min(6).max(6).required(),
      amount: Joi.number().min(1).required(),
      notes: Joi.string().optional()
    };
  
    return Joi.validate(transaction, schema);
  };

  function validateBalanceCheck(account) {
    const schema = {
      account_id: Joi.string().min(12).max(12).required(),
      inside_code: Joi.string().required()
    };
  
    return Joi.validate(account, schema);
  };


module.exports = router; 