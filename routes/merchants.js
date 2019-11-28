const auth = require('../middleware/auth');
const Merchant = require("../models/index")["Merchant"];
const DamenMerchant = require("../models/index")["DamenMerchant"];
const Transaction = require("../models/index")["Transaction"];
const express = require('express');
const paginate = require('express-paginate');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const gov_id = req.query.gov_id;
  let whereOptions = {};
  if (gov_id) whereOptions['gov_code'] =  gov_id;
  const results = await Merchant.findAndCountAll({
    limit: req.query.limit, 
    offset: req.skip,
    include: [{model: DamenMerchant, where: whereOptions}]
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


// router.get('/', auth, async (req, res) => {
//   const gov_id = req.query.gov_id;
//   let whereOptions = {};
//   if (gov_id) whereOptions['gov_code'] =  gov_id;
//   const results = await DamenMerchant.findAndCountAll({
//     where: whereOptions,
//     limit: req.query.limit, 
//     offset: req.skip
//   });
  
//     const itemCount = results.count;
//     const pageCount = Math.ceil(results.count / req.query.limit);

//     res.json({
//       data: results.rows,
//       pageCount,
//       itemCount,
//       has_more: paginate.hasNextPages(req)(pageCount)
//     });
// });


router.get('/:id/transactions', auth, async (req, res) => {
  const merchant = await Merchant.findByPk(req.params.id);

  if (!merchant) return res.status(404).send('merchant is not found.');
  transactions = await Transaction.findAll({ where: {merchant_id : merchant.id }})
 
  res.send(transactions);
});


router.get('/:id', auth, async (req, res) => {
  const merchant = await Merchant.findOne({where: {id: req.params.id}});

  if (!merchant) return res.status(404).send('merchant not found.');

  res.send(merchant);
});


module.exports = router; 