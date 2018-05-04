'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Tag} = require('../models/tag');
const {Note} = require('../models/note');



/* ========== GET/READ ALL ITEM ========== */

router.get('/', (req, res, next) => {

  Tag.find()
    .sort('id')
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

router.post('/', (req,res,next) => {
  const {name} = req.body;
  const newTag = {
    name
  };

  if(!newTag.name) {
    const err = new Error('name value required');
    err.status = 400;
    return next(err);
  }

  Tag.create(newTag)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists, please choose another');
        err.status = 400;
      }
      next(err);
    });

});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */

router.put('/:id', (req,res,next) => {
  const {id} = req.params;
  const {name} = req.body;
  const updateTag = {
    name
  };

  if(!updateTag.name) {
    const err = new Error('name value required');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  } 

  Tag.findByIdAndUpdate(id,updateTag,{new:true})
    .then(result => {
      if(result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists, please choose another');
        err.status = 400;
      }
      next(err);
    });

});




/* ========== DELETE/REMOVE A SINGLE ITEM ========== */

router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  Note.update({},{$pull : { tags: {$in: [id]} }},{multi:true})
    .then(()=> {
      return Tag.findByIdAndRemove(id);
    })
    .then(() => {
      res.sendStatus(204);            
    })
    .catch(err => {
      next(err);
    });
   





});



module.exports = router;