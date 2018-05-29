const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const logger = require('winston');
const Model = require('../server/models/product');
const auth = require('../server/middlewares/auth');

const basePath = '/product';
const { expect } = chai;

let verifyAdminRole;
let verifyToken;
let server;

describe('Products', () => {

    beforeEach((done) => {

        logger.info('beforeEach: stub de middleware');

        // fake call to verifyToken and set fake user ID
        verifyAdminRole = sinon.stub(auth, 'verifyAdminRole').callsFake((req, res, next) => next());
        verifyToken = sinon.stub(auth, 'verifyToken').callsFake((req, res, next) => {
            req.user = { _id: '123456789012345678901234' };
            next();
        });

        // until now I can require server
        server = require('../server/server');

        // clear all object from test DB
        Model.remove({}, () => { done(); });
    });

    afterEach((done) => {
        verifyAdminRole.restore();
        verifyToken.restore();
        done();
    });

    xdescribe(`${basePath} GET`, () => {
        it('it expect get a empty array', (done) => {
            request(server)
                .get(`${basePath}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.payload).be.a('Array');
                    done();
                });
        });
    });
    xdescribe(`${basePath}/:id GET`, () => {
        it('it does not get product, because does not exists', (done) => {
            request(server)
                .get(`${basePath}/123456123456`)
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.err).be.a('Object');
                    done();
                });
        });
        it('it expect get a single product', (done) => {
            let data = new Model({
                name: 'product name',
                unitPrice: '5',
                category: '012345678901234567890123'
            });

            data.save((err, savedProduct) => {
                request(server)
                    .get(`${basePath}/${savedProduct._id}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.body).be.a('Object');
                        expect(res.body.payload).be.a('Object');
                        expect(res.body.payload).has.property('_id');
                        expect(res.body.payload._id).eql(`${savedProduct._id}`);
                        done();
                    });
            });
        });
    });
    describe(`${basePath} POST`, () => {
        it('it does not expect new product', (done) => {
            request(server)
                .post(`${basePath}`)
                .expect('Content-Type', /json/)
                .expect(400)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.err).be.a('Object');
                    done();
                });
        });
        xit('it expect new product', (done) => {

            let data = {
                name: 'product name',
                unitPrice: '5',
                category: '012345678901234567890123'
            };

            request(server)
                .post(`${basePath}`)
                .send(data)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.payload).be.a('Object');
                    expect(res.body.payload).has.property('_id');
                    done();
                });
        });
    });
    xdescribe(`${basePath}/:id PUT`, () => {
        it('it does not update product, because does not exists', (done) => {
            request(server)
                .put(`${basePath}/123456123456`)
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.err).be.a('Object');
                    done();
                });
        });
        it('it expect updated category', (done) => {

            let data = new Model({
                name: 'product name',
                unitPrice: '5',
                category: '012345678901234567890123'
            });

            data.save((err, savedData) => {
                savedData.description = 'Other name';
                request(server)
                    .put(`${basePath}/${savedData._id}`)
                    .send(savedData)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.body).be.a('Object');
                        expect(res.body.payload).be.a('Object');
                        expect(res.body.payload).has.property('_id');
                        expect(res.body.payload.description).eql('Other name');
                        done();
                    });
            });
        });
    });
    xdescribe(`${basePath}/:id DELETE`, () => {
        it('it does not delete product, because does not exists', (done) => {
            request(server)
                .delete(`${basePath}/123456123456`)
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.err).be.a('Object');
                    done();
                });
        });
        it('it expect delete product', (done) => {

            let data = new Model({
                description: 'New Desc'
            });

            data.save((err, data) => {
                request(server)
                    .delete(`${basePath}/${data._id}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.body).be.a('Object');
                        expect(res.body.payload).be.a('Object');
                        expect(res.body.payload).has.property('_id');
                        expect(res.body.payload._id).eql(`${data._id}`);
                        done();
                    });
            });
        });
    });
});