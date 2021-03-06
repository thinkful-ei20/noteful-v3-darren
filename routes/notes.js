'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
// mongoose.Promise = global.Promise;

const {Note} = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  const {searchTerm,folderId,tagId} = req.query;
 
  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    // filter.title = { $regex: re };
    filter.$or = [{title: { $regex: re }},{ content:{ $regex: re } }];
  }
  if (folderId){
    filter.folderId = folderId;
  }
  if(tagId){
    filter.tags = tagId;
  }
 

  Note.find(filter)
    .sort('-updatedAt')
    .populate('tags')
    .then(results => {
      res.json(results);
      // console.log(filter);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  const id = req.params.id; 
  
  if(!mongoose.Types.ObjectId.isValid(id)){
    const err = new Error('The `id` is not valid');
    return res.status(404).send(err.message);
    // err.status = 404;
    // return next(err);
  } 

  Note.findById(id)  
    .populate('tags')    
    .then(results => {
      if(results) {
        res.json(results);
      } else {
        next(); 
      }           
    })
    .catch(err => {
      next(err);
    });
});


/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content, folderId, tags = []} = req.body;

  const newItem = {
    title,
    content,
    tags
  };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    newItem.folderId = folderId;
  }

  if(tags) {
    tags.forEach((tag) => {
      if(!mongoose.Types.ObjectId.isValid(tag)){
        const err = new Error('The `id` is not valid');
        // return res.status(404).send(err.message);
        err.status = 404;
        return next(err);
      } 
      // newItem.tags = tags;
    });    
  }

  Note.create(newItem)      
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    });
});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId,tags = [] } = req.body;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateItem = { title, content,tags };

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    updateItem.folderId = folderId;
  }
  if(tags) {
    tags.forEach((tag) => {
      if(!mongoose.Types.ObjectId.isValid(tag)){
        const err = new Error('The `id` is not valid');
        // return res.status(404).send(err.message);
        err.status = 404;
        return next(err);
      } 
    });    
  }

  Note.findByIdAndUpdate(id, updateItem, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
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

  return Note.findByIdAndRemove(id)      
    .then(() => {
      res.sendStatus(204);            
    })
    .catch(err => {
      next(err);
    });
});



module.exports = router;