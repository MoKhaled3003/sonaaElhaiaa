const auth = require('../middleware/auth');
const Beneficiary = require("../models/index")["Beneficiary"];
const Merchant = require("../models/index")["Merchant"];
const Account = require("../models/index")["Account"];
const express = require('express');
const paginate = require('express-paginate');
const router = express.Router();


const auth = require('../middleware/auth');
const Beneficiary = require("../models/index")["Beneficiary"];
const Merchant = require("../models/index")["Merchant"];
const express = require('express');
const router = express.Router();
const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);


router.post('/upload', auth, async function(req, res) {
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
   
    let benf_data = req.files.benf_data;
    const gov_id = req.body.gov_id;


    file_path = appDir + '/uploads/' + 'temp.xlsx';
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
             const nid = row[2];
             
             if (nid){
                const found = await Beneficiary.findOne( { where: { nid: row[2] }});
                
                if(! found){
                  const m_id = row[18];
                  const m_name = row[19];
                  const m_address = row[20];
                  const m_phone = row[21];
                  await Merchant.findOrCreate({where: {id: m_id}, 
                  defaults: {
                    id: m_id,
                    name: m_name,
                    address: m_address,
                    phone: m_phone
                  }});
                  await Beneficiary.create({ 
                    name: row[1], 
                    nid: row[2], 
                    gender: row[5],
                    gov_id: gov_id,
                    town: row[8],
                    village: row[9]
                  });



                }
                

             }

                
        }
      }

  res.send('Done');
    });
  });


module.exports = router; 

module.exports = router; 