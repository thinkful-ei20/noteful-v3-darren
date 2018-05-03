'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Folder} = require('../models/folder');


/* ========== GET/READ ALL ITEM ========== */

router.get('/', (req, res, next) => {

  Folder.find()
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

  let {id} = req.params;
  
  Folder.findById(id)
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        res.status(404).send('ID not valid');
      }           
    })
    .catch(err => {
      next(err);
    });
});


/* ========== POST/CREATE AN ITEM ========== */




/* ========== PUT/UPDATE A SINGLE ITEM ========== */




/* ========== DELETE/REMOVE A SINGLE ITEM ========== */





module.exports = router;