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

  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    // return res.status(404).send(err.message);
    err.status = 400;
    return next(err);
  } 
  
  Folder.findById(id)
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        const err = new Error('`Id` does not exist');
        res.status(404).send(err.message);
      }           
    })
    .catch(err => {
      next(err);
    });
});


/* ========== POST/CREATE AN ITEM ========== */

router.post('/', (req,res,next) => {
  const {name} = req.body;

  const newFolder = {
    name
  };

  if(!newFolder.name) {
    const err = new Error('name value required');
    err.status = 400;
    return next(err);
  }

  Folder.create(newFolder).
    then(results => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
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
  const folderId = req.params.id;

  const {name} = req.body;

  if(!name) {
    const err = new Error('name value required');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(folderId)){
    const err = new Error('The `id` is not valid');
    // return res.status(404).send(err.message);
    err.status = 400;
    return next(err);
  } 

  const updateFolder = {
    name
  };

  Folder.findByIdAndUpdate(folderId, updateFolder, {new:true})
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */

router.delete('/:id', (req, res, next) => {

  let id = req.params.id;

  return Folder.findByIdAndRemove(id)      
    .then(() => {
      res.sendStatus(204);            
    })
    .catch(err => {
      next(err);
    });
});



module.exports = router;