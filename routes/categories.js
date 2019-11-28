const auth = require('../middleware/auth');
const Category = require("../models/index")["Category"];
const {validate} = require('../models/category');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const cats = await Category.findAll()
  res.send(cats);
});


router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let cat = await Category.findOne({where: { label: req.body.label }});
  if (cat) return res.status(400).send('babel already exists.');

  cat = new Category(_.pick(req.body, ['label']));
  
  await cat.save();

  res.status(201).send('created')
});


router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  let cat = await Category.findOne({where: { id: req.params.id }});
  if (!cat) return res.status(404).send('category is not found.');
  cat = await Category.update(
    { label: req.body.label },
    { where: { id: req.params.id } }
  )

  
  res.status(200).send('OK');
});

module.exports = router; 
