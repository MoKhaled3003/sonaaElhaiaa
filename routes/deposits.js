const auth = require('../middleware/auth');
const Beneficiary = require("../models/index")["Beneficiary"];
const Deposit = require("../models/index")["Deposit"];
const Account = require("../models/index")["Account"];
const express = require('express');
const paginate = require('express-paginate');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');
const router = express.Router();





router.get('/', auth, async (req, res) => {
  let benFilters = {};
  let depositFilters = {};
  const gov_id = req.query.cityId;
  const from = req.query.from;
  const to = req.query.to;
  const benName = req.query.benName;
  const natId = req.query.natId;
  const accountNum = req.query.accountNum;
  if (accountNum) depositFilters['account_id']= accountNum;
  if (gov_id) benFilters['gov_id'] =  gov_id;
  if (natId) benFilters['nid'] =  natId;
  if(benName) benFilters['name'] = { [Op.like]:`%${benName}%`}

  let createdFilters = {}

  if (from) createdFilters[Op.gt]=moment(from, "DD-MM-YYYY").startOf('day');
  if (to) createdFilters[Op.lt]=moment(to, "DD-MM-YYYY").endOf('day');
  
  if (from || to ) depositFilters['created_at'] = createdFilters;

  const results = await Deposit.findAndCountAll({
    where: depositFilters,
    limit: req.query.limit, 
    offset: req.skip,
    include: [{
      model: Account,
      attributes: ['id','is_active','balance']
    },{
      model: Beneficiary,
      attributes: ['id','name','nid','gov_id'],
      where: benFilters
    }]
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


module.exports = router; 