'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const {Note} = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful App v3 NOTES', function() {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(() => Note.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });



  describe('GET /api/notes', function () {
    // 1) Call the database **and** the API
    // 2) Wait for both promises to resolve using `Promise.all`
    it('should return the correct number of Notes', function () {

      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
      // 3) then compare database results to API response
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return a list with the correct right fields', function () {
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt','folderId');
          });
        });
    });

    it('should return correct search results for a searchTerm query', function () {
      const searchTerm = 'gaga';
      const re = new RegExp(searchTerm, 'i');

      return Promise.all([
        Note.find({ title: { $regex: re } }),
        chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].id).to.equal(data[0].id);
        });
    });

    it('should return an empty array for an incorrect query', function () {
      const searchTerm = 'NotValid';
      const re = new RegExp(searchTerm, 'i');

      return Promise.all([
        Note.find({ title: { $regex: re } }),
        chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`)
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

  });




  describe('GET /api/notes/:id', function () {

    it('should return correct notes', function () {
      let data;
      // 1) First, call the database
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          // 2) **then** call the API
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content','createdAt','updatedAt','folderId');

          // 3) **then** compare
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    it('should respond with a 404 for improperly formatted id', function () {
      const badId = '99-99-99';

      return chai.request(app)
        .get(`/api/notes/${badId}`)
        .then(res => {
          expect(res).to.have.status(404);
          expect(res.text).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an invalid id', function () {

      return chai.request(app)
        .get('/api/notes/AAAAAAAAAAAAAAAAAAAAAAAA')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };
  
      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
      // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });
    it('should return an error when posting an object with a missing "title" field', function () {
      const newItem = {
        'content': 'Lorem ipsum dolor sit amet, sed do eiusmod tempor...'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('PUT /api/notes/:id', function () {

    it('should update a note at given id', function () {
      const updateData = {
        title: 'this is a test title',
        content: 'this is test content'
      };

      return Note.findOne().then(function(note) {
        updateData.id = note.id;

        return chai.request(app)
          .put(`/api/notes/${note.id}`)
          .send(updateData);
      })
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');

          return Note.findById(updateData.id);
        })
        .then(function(note){
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        });
    });
    it('should return an error when missing "title" field', function () {
      const updateItem = {
        'foo': 'bar'
      };

      return chai.request(app)
        .put('/api/notes/9999')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });
    
    it('should respond with a 400 for improperly formatted id', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };
      const badId = '99-99-99';

      return chai.request(app)
        .put(`/api/notes/${badId}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an invalid id', function () {
      const updateItem = {
        'title': 'What about dogs?!',
        'content': 'woof woof'
      };

      return chai.request(app)
        .put('/api/notes/AAAAAAAAAAAAAAAAAAAAAAAA')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });
    
  });

  describe('DELETE /api/notes/:id', function() {

    it('should delete the note at given id', function() {
      let note;

      return Note
        .findOne()
        .then(function (_note) {
          note = _note;
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Note.findById(note.id);
        })
        .then(function(_note){
          expect(_note).to.be.null;
        });
    });
  });

});


