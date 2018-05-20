const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const Model = require('../server/models/user');
const auth = require('../server/middlewares/auth');

const basePath = '/usuario';
const { expect } = chai;

let verifyToken;
let server;

describe('Users', () => {

    beforeEach((done) => {

        // fake call to verifyToken and set fake user ID
        verifyToken = sinon.stub(auth, 'verifyToken').callsFake((req, res, next) => {
            req.usuario = { _id: '123456789012345678901234' };
            next();
        });

        // until now I can require server
        server = require('../server/server');

        // clear all object from test DB
        Model.remove({}, () => { done(); });
    });

    afterEach((done) => {
        verifyToken.restore();
        done();
    });

    describe(`${basePath} GET`, () => {
        it('it should get empty array', (done) => {
            request(server)
                .get(`${basePath}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    expect(res.body).be.a('Object');
                    done();
                });
        });
    });
});