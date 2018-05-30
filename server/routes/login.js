const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/user');

const app = express();
const client = new OAuth2Client(process.env.CLIENT_ID);

let verify = async (token) => {

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
};

let createToken = (payload) => {
    return jwt.sign({ payload }, 'asdf', { expiresIn: process.env.CADUCIDAD_TOKEN });
};

app.post('/', (req, res) => {

    let { email, password } = req.body;

    User.findOne({ email }, (err, foundData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!foundData || !bcrypt.compareSync(password, foundData.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o clave invalido'
                }
            });
        }

        return res.json({
            ok: true,
            payload: {
                user: foundData,
                token: createToken(foundData)
            }
        });
    });

});

app.post('/google', async(req, res) => {

    let { token } = req.body;

    let googleUser = await verify(token)
        .catch((err) => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    User.findOne({ email: googleUser.email }, (err, foundData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (foundData) {
            if (!foundData.google) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Login with user and password' }
                });
            } else {
                return res.json({
                    ok: true,
                    usuario: foundData,
                    token: createToken(foundData)
                });
            }
        } else {
            let user = new User(googleUser);
            user.password = '*****';

            user.save((err, savedData) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    usuario: savedData,
                    token: createToken(foundData)
                });
            });
        }
    });
});

module.exports = app;