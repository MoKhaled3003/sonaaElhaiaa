const auth = require('../middleware/auth');
const Governorate = require("../models/index")["Governorate"];
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const govs = await Governorate.findAll()
  res.send(govs);
});


module.exports = router; 
