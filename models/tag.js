'use strict';

const mongoose = require('mongoose');

const tagsSchema = mongoose.Schema( {
  name: {type: String, required: true, unique:true}
}, {
  timestamps: true
});

tagsSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Tag = mongoose.model('Tag', tagsSchema);

module.exports = {Tag};
