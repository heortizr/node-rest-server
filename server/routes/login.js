const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const User = require('../models/user');

const app = express();
const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(token) {

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
}

app.post('/', (req, res) => {

    let { body } = req;

    User.findOne({ email: body.email }, (err, foundUser) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!foundUser) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o clave invalido'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, foundUser.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o clave invalido'
                }
            });
        }

        let token = jwt.sign({ payload: foundUser }, 'asdf', { expiresIn: process.env.CADUCIDAD_TOKEN });

        return res.json({
            ok: true,
            payload: {
                user: foundUser,
                token
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

    User.findOne({ email: googleUser.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (userDB) {
            if (!userDB.google) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Debe utilizar autenticacion normal' }
                });
            } else {
                let token = jwt.sign({ payload: userDB }, 'asdf', { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: userDB,
                    token
                });
            }
        } else {
            let usuario = new User();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = '*****';
            usuario.google = true;

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});

module.exports = app;