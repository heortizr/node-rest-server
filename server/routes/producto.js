const express = require('express');

const Producto = require('../models/producto');
const { verificaToken } = require('../middlewares/auth');

const app = express();

app.get('/', [verificaToken], (req, res) => {

    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limite || 5);

    Producto.find({})
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria')
        .exec((err, productos) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                productos
            });

        });
});

app.get('/:id', [verificaToken], (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria')
        .exec((err, producto) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                producto
            });

        });

});

app.get('/buscar/:search', [verificaToken], (req, res) => {

    let regex = new RegExp(req.params.search, 'i');

    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria')
        .exec((err, producto) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                producto
            });

        });

});

app.post('/', [verificaToken], (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha creado el producto'
                }
            });
        }

        return res.json({
            ok: true,
            producto: productoDB
        });
    });

});

app.put('/:id', [verificaToken], (req, res) => {

    let body = {
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        categoria: req.body.categoria,
    };
    let id = req.params.id;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            producto: categoriaDB
        });
    });
});

app.delete('/:id', [verificaToken], (req, res) => {

    let id = req.params.id;

    Producto.findOneAndRemove(id, (err, categoriaBorrada) => {
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