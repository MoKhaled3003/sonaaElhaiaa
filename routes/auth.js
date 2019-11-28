const Joi = require('joi');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const _ = require('lodash');
const User = require("../models/index")["User"];
const express = require('express');
const {validatePassword} = require('../models/user');
const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({where: { email: req.body.email }});
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  res.send(token);
});


router.post('/change_password', auth, async (req, res) => {
  const { error } = validatePassword(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  let user = await User.findOne({where: { email: req.user.email }});
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');


  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();
  
  res.status(200).send('OK');
});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };

  return Joi.validate(req, schema);
}

module.exports = router; 
