const bcrypt = require('bcrypt');
const jwt = require('json-web-token');
const express = require('express');

const Usuario = require('../models/usuario');

const app = express();

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



module.exports = app;