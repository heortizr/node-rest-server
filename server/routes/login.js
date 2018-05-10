const bcrypt = require('bcrypt');
const jwt = require('json-web-token');
const express = require('express');
const { OAuth2Client } = require('google-auth-library');

const Usuario = require('../models/usuario');

const app = express();
const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
        // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o clave invalido'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o clave invalido'
                }
            });
        }

        let token = jwt.sign({ payload: userDB }, 'asdf', { expiresIn: process.env.CADUCIDAD_TOKEN });

        return res.json({
            ok: true,
            usuario: userDB,
            token
        });
    });

});

app.post('/google', async(req, res) => {

    let token = req.body.token;

    let googleUser = await verify(token)
        .catch((err) => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Debe utilizar autenticacion normal' }
                });
            } else {
                let token = jwt.sign({ payload: userDB }, 'asdf', { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            let usuario = new Usuario();

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

    res.json({
        ok: true,
        user: googleUser
    });
});

module.exports = app;