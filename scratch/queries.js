'use strict'; 

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const { MONGODB_URI } = require('../config');

const {Note} = require('../models/note');



//get all by search term
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       const re = new RegExp(searchTerm, 'i');
//       // filter.title = { $regex: re };
//       filter.$or = [{title: { $regex: re }},{ content:{ $regex: re } }];
//     }

//     return Note.find(filter)
//       .sort('created')
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//get by id

// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000005';  

//     return Note.findById(id)      
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


//POST new notes using Note.create

// mongoose.connect(MONGODB_URI)
//   .then(() => {

//     return Note.create({
//       title: 'Test creation',
//       content: 'this probably will mention cats'
//     })      
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// UPDATE new notes using Note.findByIdAndUpdate

// mongoose.connect(MONGODB_URI)
//   .then(() => {      

//     return Note.findByIdAndUpdate('000000000000000000000006',{
//       title: 'Update the title',
//       content: 'the content is also updated'
//     }, {
//       new: true
//     })      
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// DELETE note by Note.findByIdAndRemove


// mongoose.connect(MONGODB_URI)
//   .then(() => {      

//     return Note.findByIdAndRemove('000000000000000000000007')      
//       .then(results => {
//         console.log(results);
//       })
//       .catch(console.error);
//   })
//   .then(() => {
//     return mongoose.disconnect()
//       .then(() => {
//         console.info('Disconnected');
//       });
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });