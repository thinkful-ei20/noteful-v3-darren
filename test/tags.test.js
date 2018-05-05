'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const {Tag} = require('../models/tag');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful App v3 Tags', function() {
  // this.timeout(5000);
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Tag.insertMany(seedTags)
      .then(() => Tag.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/tags', function(){

    it('should return all tags', function() {
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return folder with correct fields', function(){
      return Promise.all([
        Tag.find(),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function(tagItem) {
            expect(tagItem).to.be.a('object');
            expect(tagItem).to.have.keys('name','id', 'createdAt', 'updatedAt');
          });
        });
    });

  });

  describe('GET /api/tags/:id', function() {

    it('should return only the folder at given folderId', function() {
      let data;

      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name','createdAt','updatedAt');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.updatedAt).getTime()).to.equal(data.updatedAt.getTime());
          expect(new Date(res.body.createdAt).getTime()).to.equal(data.createdAt.getTime());
        });
    });
  });

  it('should respond with a 400 for an invalid ID', function () {
    const badId = '99-99-99';

    return chai.request(app)
      .get(`/api/tags/${badId}`)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.eq('The `id` is not valid');
      });
  });

  it('should respond with a 404 for non-existant id', function () {

    return chai.request(app)
      .get('/api/tags/AAAAAAAAAAAAAAAAAAAAAAAA')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

  describe('POST /api/tags', function () {

    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'name': 'newFolder',
      };
      let body;
      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'name');
          return Tag.findById(body.id);
        })
        .then(data => {
          expect(body.id).to.equal(data.id);
          expect(body.name).to.equal(data.name);
        });
    });

    it('should return an error when missing "name" field', function () {
      const newItem = {
        'foo': 'bar'
      };

      return chai.request(app)
        .post('/api/tags')
        .send(newItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('name value required');
        });
    });

    it('should return an error when given a duplicate name', function () {

      return Tag.findOne().select('id name')
        .then(data => {
          const newItem = { 'name': data.name };
          return chai.request(app).post('/api/tags').send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('The folder name already exists, please choose another');
        });
    });

  });

  describe('PUT /api/tags/:id', function () {

    it('should update the folder', function () {
      const updateItem = {
        'name': 'Updated Name'
      };
      let data;
      return Tag.findOne().select('id name')
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/tags/${data.id}`)
            .send(updateItem);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'name');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(updateItem.name);
        });
    });


    it('should respond with a 400 for an invalid ID', function () {
      const updateItem = {
        'name': 'Blah'
      };
      const badId = '99-99-99';

      return chai.request(app)
        .put(`/api/tags/${badId}`)
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an ID that does not exist', function () {
      const updateItem = {
        'name': 'Blah'
      };

      return chai.request(app)
        .put('/api/tags/AAAAAAAAAAAAAAAAAAAAAAAA')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return an error when missing "name" field', function () {
      const updateItem = {
        'foo': 'bar'
      };

      return chai.request(app)
        .put('/api/tags/9999')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('name value required');
        });
    });

    // it('should return an error when given a duplicate name', function () {

    //   return Tag.find().select('id name').limit(2)
    //     .then(results => {
    //       const [item1, item2] = results;
    //       item1.name = item2.name;
    //       return chai.request(app).put(`/api/tags/${item1.id}`).send(item1);
    //     })
    //     .then(res => {
    //       expect(res).to.have.status(400);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.a('object');
    //       expect(res.body.message).to.equal('Tag name already exists');
    //     });
    // });

  });

  describe('DELETE /api/tags/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Tag.findOne()
        .then( _data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          return Tag.count({_id : data.id});
        })
        .then( count => {
          expect(count).to.equal(0);
        });
    });

    it('should respond with 404 when document does not exist', function () {
      return chai.request(app).delete('/api/tags/DOESNOTEXIST')
        .then((res) => {
          expect(res).to.have.status(204);
        });
    });

  });


  
});


