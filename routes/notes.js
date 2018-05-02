'use strict';

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {Note} = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  const {searchTerm} = req.query;
  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    // filter.title = { $regex: re };
    filter.$or = [{title: { $regex: re }},{ content:{ $regex: re } }];
  }

  Note.find(filter)
    .sort('-updatedAt')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// console.log('Get All Notes');
// res.json([
//   { id: 1, title: 'Temp 1' },
//   { id: 2, title: 'Temp 2' },
//   { id: 3, title: 'Temp 3' }
// ]);



/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  const id = req.params.id;  

  Note.findById(id)      
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

// console.log('Get a Note');
// res.json({ id: 1, title: 'Temp 1' });



/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  const { title, content } = req.body;

  const newItem = {
    title,
    content    
  };

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note.create(newItem)      
    .then(results => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    });
});

// console.log('Create a Note');
// res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  const noteId = req.params.id;
  const { title, content } = req.body;

  /***** Never trust users. Validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title: title,
    content: content    
  };

  Note.findByIdAndUpdate(noteId, updateItem, {new: true})      
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

// console.log('Update a Note');
// res.json({ id: 1, title: 'Updated Temp 1' });


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

// console.log('Delete a Note');
// res.status(204).end();


module.exports = router;