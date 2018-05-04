'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const {Folder} = require('../models/folder');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful App v3 FOLDERS', function() {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Folder.insertMany(seedFolders)
      .then(() => Folder.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/folders', function(){

    it('should return all folders', function() {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
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
        Folder.find(),
        chai.request(app).get('/api/folders')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function(folderItem) {
            expect(folderItem).to.be.a('object');
            expect(folderItem).to.have.keys('name','id', 'createdAt', 'updatedAt');
          });
        });
    });

  });

  describe('GET /api/folders/:id', function() {

    it('should return only the folder at given folderId', function() {
      let data;

      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/folders/${data.id}`);
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


  
});


