const auth = require('../middleware/auth');
const IncomeGenerationBeneficiary = require("../models/index")["IncomeGenerationBeneficiary"];
const IncomeGenerationDeposit = require("../models/index")["IncomeGenerationDeposit"];
const express = require('express');
const router = express.Router();
const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const __ = require("i18n").__;
const Joi = require("joi");
const moment = require('moment');
const sequelize = require("../models/index").sequelize;
const appDir = path.dirname(require.main.filename);


router.post('/upload', auth, async function(req, res) {
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    let benf_data = req.files.file_data;
    

    file_path = appDir + '/uploads/' + 'in_temp.xlsx';
    benf_data.mv( file_path , async function(err) {
      if (err)
        return res.status(500).send(err);
     const obj = xlsx.parse(fs.readFileSync(file_path)); // parses a buffer

     let data = obj[0]['data'];
     let rejections = []
     let imported = 0;
     let rejected = 0;
     console.log(data);

     await IncomeGenerationBeneficiary.update({is_active:false},{where: {}})

     for (const [index, row] of  data.entries()) {
        //console.log(index, row);
         if (index === 0 ) continue;
         
         if (!row[2]) break;
         const nid = row[2].toString().replace(/\s+/g, '');
         if (row) {
             //console.log(index, row[2]);
             

             let row_data = { 
              name: row[1], 
              nid: nid, 
              gov: row[3],
              notes: row[4],
              
            };

            const { error } = validateBen(row_data); 
            if (error){
              rejected += 1;
              rejections.push({serial: row[0], ...row_data, reason: __("invalid_data")});
              continue;
            }
             
             if ( nid){
                const found = await IncomeGenerationBeneficiary.findOne( { where: { nid: nid, is_active: true }});
                if(found){
                  rejected += 1;
                  rejections.push({serial: row[0], ...row_data, reason: __("national id already exist")});
                  continue;
                }
                else{

                  const ben = await IncomeGenerationBeneficiary.upsert({ 
                    ...row_data,
                    is_active: true
                   
                  });

        imported += 1;


                }
                

             }

                
        }
      }

  res.json({imported, rejected, rejections });
    });
  });


  router.post('/transaction', auth, async (req, res) => {
    console.log("==============");
    const { error } = validateDeposit(req.body); 
    if (error) {
      console.error(error);
      return res.status(400).send(__("invalid_data"));
    }
    const amount = req.body.amount;
    const ben_nid = req.body.nid;
    

    let transaction;  
    try {
      transaction = await sequelize.transaction();
      let ben = await IncomeGenerationBeneficiary.findOne({where: { nid: ben_nid }, transaction, lock: transaction.LOCK.UPDATE});
      if (! ben) return res.status(400).send(__('Beneficiary is not found'));
      if (! ben.is_active) return res.status(400).send(__('Beneficiary is not active'));

      const t = await IncomeGenerationDeposit.create({ 
          income_gen_ben_id: ben.id,
          amount: amount,
          notes: ''
        },{transaction});

  
      await transaction.commit();
      let d = moment(t.createdAt)
      res.json({ 
        transaction_id : t.id, 
        ben_id: ben.id, 
        transaction_amount: t.amount,
        beneficiary: ben.name,
        beneficiary_nid: ben.nid,
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



  router.post('/check', async (req, res) => {
    console.log("==============");
    

    const { error } = validateQuery(req.body); 
    if (error) {
      console.error(error);
      return res.status(400).send(__("invalid_data"));
    }
    const ben_nid = req.body.nid;



    let ben = await IncomeGenerationBeneficiary.findOne({where: { nid: ben_nid }});
    if (! ben) return res.status(400).send(__('Beneficiary is not found'));
    if (! ben.is_active) return res.status(400).send(__('Beneficiary is not active'));
    res.json({ 
      
      beneficiary_id: ben.id, 
      beneficiary_name: ben.name,
      beneficiary_nid: ben.nid,
      beneficiary_gov: ben.gov
   

    });
    
    
  });


  function validateBen(m) {
    const schema = {
      nid: Joi.string().min(14).max(14).required(),
      name: Joi.string().required(),
      gov: Joi.string().optional(),
      notes: Joi.string().optional()
    };
  
    return Joi.validate(m, schema);
  };



  function validateDeposit(d) {
    const schema = {
      nid: Joi.string().min(14).max(14).required(),
      amount: Joi.number().min(1).required(),
      notes: Joi.string().optional()
    };
  
    return Joi.validate(d, schema);
  };


  function validateQuery(q) {
    const schema = {
      nid: Joi.string().min(14).max(14).required()
    };
  
    return Joi.validate(q, schema);
  };


module.exports = router; 