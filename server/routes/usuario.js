const bcrypt = require('bcrypt');
const express = require('express');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificaToken } = require('../middlewares/auth');

const app = express();



app.get('/', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;

    desde = Number(desde);
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email img estado role google')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({ estado: true }, (err, total) => {
                return res.json({
                    ok: true,
                    total,
                    usuarios
                });
            });

        });

});

app.post('/', verificaToken, (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/:id', verificaToken, (req, res) => {

    let campos = ['name', 'email', 'img', 'role', 'estado'];
    let body = _.pick(req.body, campos);
    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.delete('/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = { estado: false };

    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;