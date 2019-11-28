const winston = require('winston');
const express = require('express');
const app = express();


require('./startup/logging')();
require('./startup/routes')(app);


const port = process.env.PORT || 5551;
const server = app.listen(port, () => winston.info(`Listening on port ${port}...`));

module.exports = server;

// const express = require('express');
// const fileUpload = require('express-fileupload');
// const xlsx = require('node-xlsx');
// const fs = require('fs');
// const cors = require('cors');
// const swaggerUi = require('swagger-ui-express');


// const app = express();
// app.use(cors());
// app.set('port', (process.env.PORT || 8081));

// // default options
// app.use(fileUpload());



//   app.post('/upload', function(req, res) {
//     if (Object.keys(req.files).length == 0) {
//       return res.status(400).send('No files were uploaded.');
//     }
  
//     // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
//     let benf_data = req.files.benf_data;
  
//     // Use the mv() method to place the file somewhere on your server

//     file_path = __dirname + '/uploads/' + 'temp.xlsx';
//     benf_data.mv( file_path , function(err) {
//       if (err)
//         return res.status(500).send(err);
//      const obj = xlsx.parse(fs.readFileSync(file_path)); // parses a buffer


//       res.send(obj[0]['data']);
//     });
//   });


//   app.listen(app.get('port'), function () {
//     console.log('API Server Listening on port ' + app.get('port') + '!')
//   })




