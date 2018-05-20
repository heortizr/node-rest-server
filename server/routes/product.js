const express = require('express');

const Product = require('../models/product');
const { verifyToken } = require('../middlewares/auth');

const app = express();

app.get('/', [verifyToken], (req, res) => {

    let from = Number(req.query.from || 0);
    let limit = Number(req.query.limit || 5);

    Product.find({})
        .skip(from)
        .limit(limit)
        .sort('name')
        .populate('user', 'name email')
        .populate('Category')
        .exec((err, products) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                payload: products
            });

        });
});

app.get('/:id', [verifyToken], (req, res) => {

    let { id } = req.params;

    Product.findById(id)
        .populate('user', 'name email')
        .populate('category')
        .exec((err, product) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                payload: product
            });

        });

});

app.get('/buscar/:search', [verifyToken], (req, res) => {

    let regex = new RegExp(req.params.search, 'i');

    Product.find({ name: regex })
        .populate('user', 'name email')
        .populate('category')
        .exec((err, product) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                product
            });

        });

});

app.post('/', [verifyToken], (req, res) => {

    let product = new Product({
        name: req.body.name,
        unitPrice: req.body.unitPrice,
        category: req.body.category,
        user: req.body.user._id
    });

    product.save((err, savedProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: savedProduct
        });
    });

});

app.put('/:id', [verifyToken], (req, res) => {

    let { id } = req.params;
    let body = {
        name: req.body.name,
        unitPrice: req.body.unitPrice,
        category: req.body.category
    };

    Product.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, updatedProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: updatedProduct
        });
    });
});

app.delete('/:id', [verifyToken], (req, res) => {

    let { id } = req.params;

    Product.findOneAndRemove(id, (err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            categoria: deletedProduct
        });
    });
});

module.exports = app;