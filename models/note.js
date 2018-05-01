'use strict';

const mongoose = require('mongoose');

const noteSchema = mongoose.Schema( {
  title: {type: String, required: true},
  content: {type: String, required: true},
  createdAt: Date,
  updatedAt: Date
});

const Note = mongoose.model('Note', noteSchema);

module.exports = {Note};
