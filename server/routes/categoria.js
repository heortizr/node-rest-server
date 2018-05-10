const express = require('express');

const Categoria = require('../models/categoria');
const { verificaToken, verificaAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/', verificaToken, (req, res) => {

    Categoria.find({})
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                categorias
            });

        });
});

app.get('/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id)
        .exec((err, categoria) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                categoria
            });

        });

});

app.post('/', [verificaToken], (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha creado la categoria'
                }
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

app.put('/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let body = { descripcion: req.body.descripcion };
    let id = req.params.id;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

app.delete('/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let id = req.params.id;

    Categoria.findOneAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
});

module.exports = app;