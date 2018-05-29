const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const logger = require('winston');
const Model = require('../server/models/user');
const auth = require('../server/middlewares/auth');

const basePath = '/user';
const { expect } = chai;

let verifyAdminRole;
let verifyToken;
let server;

describe('Users', () => {

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

    describe(`${basePath} GET`, () => {
        it('it expect get a empty array', (done) => {
            request(server)
                .get(`${basePath}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    expect(res.body.payload.users).be.a('Array');
                    done();
                });
        });
    });
    describe(`${basePath}/:id GET`, () => {
        it('it does not get user, because does not exists', (done) => {
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
        it('it expect get a single user', (done) => {
            let data = new Model({
                name: 'User Name',
                email: 'test1@test.com',
                password: '123456'
            });
            data.save((err, savedUser) => {
                request(server)
                    .get(`${basePath}/${savedUser._id}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.body).be.a('Object');
                        expect(res.body.payload).be.a('Object');
                        expect(res.body.payload).has.property('_id');
                        expect(res.body.payload._id).eql(`${savedUser._id}`);
                        done();
                    });
            });
        });
    });
    describe(`${basePath} POST`, () => {
        it('it does not expect new user', (done) => {
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
        it('it expect new user', (done) => {

            let data = {
                name: 'User Name',
                email: 'test1@test.com',
                password: '123456'
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
    describe(`${basePath}/:id PUT`, () => {
        it('it does not update user, because does not exists', (done) => {
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
        it('it expect updated user', (done) => {

            let data = new Model({
                name: 'User Name',
                email: 'test1@test.com',
                password: '123456'
            });

            data.save((err, data) => {
                data.email = 'asdf@gmail.com';
                request(server)
                    .put(`${basePath}/${data._id}`)
                    .send(data)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) throw err;
                        expect(res.body).be.a('Object');
                        expect(res.body.payload).be.a('Object');
                        expect(res.body.payload).has.property('_id');
                        expect(res.body.payload.email).eql('asdf@gmail.com');
                        done();
                    });
            });
        });
    });
    describe(`${basePath}/:id DELETE`, () => {
        it('it does not delete user, because does not exists', (done) => {
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
        it('it expect delete user', (done) => {

            let data = new Model({
                name: 'User Name',
                email: 'test1@test.com',
                password: '123456'
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