const auth = require('../middleware/auth');
const Beneficiary = require("../models/index")["Beneficiary"];
const Merchant = require("../models/index")["Merchant"];
const DamenMerchant = require("../models/index")["DamenMerchant"];
const Account = require("../models/index")["Account"];
const Deposit = require("../models/index")["Deposit"];
const express = require('express');
const router = express.Router();
const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const Json2csvParser = require('json2csv').Parser;
const csv = require('neat-csv');
const __ = require("i18n").__;
const appDir = path.dirname(require.main.filename);



router.get('/export_accounts', auth, async (req, res) => {
  const gov_id = req.query.gov_id;
  let whereOptions = {};
  let whereOptions2 = {};
  if (gov_id) whereOptions2['gov_id'] =  gov_id;
  whereOptions['inside_code'] =  null;
  const results = await Account.findAndCountAll({
    where: whereOptions,
    include: [
      {model: Beneficiary,
      where: whereOptions2
    }]
  });
  
  const data= results.rows
  const fields = [
    {
      label: 'outside_code',
      value: 'id'
    },
    {
      label: 'name',
      value: 'Beneficiary.name'
    },
    {
      label: 'nid',
      value: 'Beneficiary.nid'
    },
    {
      label: 'inside_code',
      value: 'inside_code'
    }]
    
    //'id','Beneficiary.name', 'Beneficiary.nid', 'inside_code'];
  const fieldNames = ['outside_code','name', 'nid', 'inside_code'];
  const json2csvParser = new Json2csvParser({ fields: fields });
  const csv_data = json2csvParser.parse(data);

  const csvFileName = "accounts.csv"

  res.setHeader('Content-disposition', `attachment; filename=${csvFileName}`);
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv_data);
  
});


router.post('/import_accounts', auth, async function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let accounts_data = req.files.file_data;
  let rejections = []
   let imported = 0;
   let rejected = 0;
  
  file_path = appDir + '/uploads/' + 'temp_accounts.csv';
  await accounts_data.mv( file_path ) 
  
  let s = fs.createReadStream(file_path)
  
  let data = await csv(s,{headers: ['outside_code','name', 'nid', 'inside_code'],skipLines:1 });
              
  for (let r of data){
    console.log(r);
    if(!r.inside_code){
      rejected += 1;
      rejections.push({ ...r , reason: __("empty inside code")});
      continue;
     
    }
    const account = await Account.findByPk(r.outside_code.toString());
    if(!account){
      rejected += 1;
      rejections.push({ ...r , reason: __("account not found")});
      continue;
    }


    const ben = await Beneficiary.findOne( { where: { account_id: account.id }});

    if(!ben){
      rejected += 1;
      rejections.push({ ...r , reason: __("beneficiary not found")});
      continue;
    }


    if(ben.nid != r.nid){
      rejected += 1;
      rejections.push({ ...r , reason: __("nid do not match")});
      continue;
    }
    
      account.inside_code = r.inside_code;
      await account.save({fields: ['inside_code']});
      imported += 1;

    
  }
  

console.log("sending response >>>>>>>>>>>>>>>>>>>>>>>>>>");
res.json({imported, rejected, rejections });
 
});

router.post('/upload_balance', auth, async function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

 
  let benf_data = req.files.file_data;
  const notes = req.body.notes;
  const reset = (req.body.reset === 'true');

  let rejections = []
   let imported = 0;
   let rejected = 0;
   let nid_list= [];


  file_path = appDir + '/uploads/' + 'temp_balance.xlsx';
  benf_data.mv( file_path , async function(err) {
    if (err)
      return res.status(500).send(err);
      const obj = xlsx.parse(fs.readFileSync(file_path)); // parses a buffer

      let data = obj[0]['data'];
      console.log(data);

   for (const [index, row] of  data.entries()) {
      //console.log(index, row);
       if (index === 0 ) continue;
       if (row) {
           //console.log(index, row[2]);
           const name = row[1];
           const nid = row[2];

           const amount = parseFloat(row[3]);

           r = {serial: index,
            name,
            nid,
            amount
          }

          console.table(r);

          if(isNaN(r.amount)){
            rejected += 1;
            rejections.push({ ...r , reason: __("invalid amount")});
            continue;
           
          }
           
          if(!nid){
            rejected += 1;
            rejections.push({ ...r , reason: __("empty nid")});
            continue;
          }




          if(nid_list.includes(nid)){
            rejected += 1;
            rejections.push({ ...r , reason: __("duplicated nid in same file")});
            continue;
          }

          nid_list.push(nid);

              const ben = await Beneficiary.findOne( { where: { nid: row[2].toString() }});

              if(!ben){
                rejected += 1;
                rejections.push({ ...r , reason: __("beneficiary not found")});
                continue;
              }
        
                const deposit = await Deposit.create({ 
                  account_id: ben.account_id,
                  amount: amount,
                  notes: notes,
                  is_reset: reset
                });

                const account = await Account.findByPk(ben.account_id);
                if (reset){
                  account.balance = amount
                }
                else{
                  account.balance += amount
                }

                await account.save({fields: ['balance']});
                imported += 1;
              
      }
    }

    res.json({imported, rejected, rejections });
  });
});


router.post('/upload', auth, async function(req, res) {
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    let benf_data = req.files.file_data;
    const gov_id = req.body.gov_id;
    const category_id = req.body.category_id;

    file_path = appDir + '/uploads/' + 'temp.xlsx';
    benf_data.mv( file_path , async function(err) {
      if (err)
        return res.status(500).send(err);
     const obj = xlsx.parse(fs.readFileSync(file_path)); // parses a buffer

     let data = obj[0]['data'];
     let rejections = []
     let imported = 0;
     let rejected = 0;
     console.log(data);

     for (const [index, row] of  data.entries()) {
        //console.log(index, row);
         if (index === 0 ) continue;
         if (row) {
             //console.log(index, row[2]);
             const nid = row[2];

             let row_data = { 
              name: row[1], 
              nid: row[2], 
              gender: row[5],
              gov_id: gov_id,
              town: row[8],
              village: row[9]
              
            };
             
             if ( nid){
                const found = await Beneficiary.findOne( { where: { nid: row[2] }});
                if(found){
                  rejected += 1;
                  rejections.push({serial: row[0], ...row_data, reason: __("national id already exist")});
                  continue;
                }
                else{
                //   const m_id = row[18];
                 
                //   let damen_merchant = await DamenMerchant.findOne({
                //     where: { merchant_code: m_id }
                //   });
                //   if (! damen_merchant) {
                //     rejected += 1;
                //     rejections.push({serial: row[0],...row_data, reason: __("merchant not found in damen")});
                //     continue;
                //   }
                  

                //   let new_id = damen_merchant.merchant_code.toString().padStart(6, '0');
                //   await Merchant.findOrCreate({
                //     where: {id: new_id}, 
                //   defaults: {
                //     damen_id: damen_merchant.merchant_code,
                //     is_active: true
                //   }
                // });
                  const ben = await Beneficiary.create({ 
                    ...row_data,
                    // merchant_id: new_id,
                    category_id: category_id
                  });

                  const account_id = ben.generateAccountId();
                  const account = await Account.create({ id: account_id, balance: 0.0, beneficiary_id: ben.id})
                  ben.account_id = account.id;
                  await ben.save({fields: ['account_id']});
                  imported += 1;

                }
             }            
        }
      }

  res.json({imported, rejected, rejections });
    });
  });


module.exports = router; 