'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Tag} = require('../models/tag');


/* ========== GET/READ ALL ITEM ========== */

router.get('/', (req, res, next) => {

  Tag.find()
    .sort('name')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */

router.get('/:id', (req,res,next) => {
  const {id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');    
    err.status = 400;
    return next(err);
  } 

  Tag.findById(id)
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});


/* ========== POST/CREATE AN ITEM ========== */

// router.post('/', (req,res,next) => {
//   const {name} = req.body;
//   const newTag = {
//     name
//   };

//   if(!newTag.name) {
//     const err = new Error('name value required');
//     err.status = 400;
//     return next(err);
//   }

//   Tag.create(newTag)
//    .

// });


/* ========== PUT/UPDATE A SINGLE ITEM ========== */

router.put('/:id', (req,res,next) => {

});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */

router.delete('/:id', (req, res, next) => {

});



module.exports = router;