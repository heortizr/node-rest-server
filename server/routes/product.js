const express = require('express');
const logger = require('winston');

const Product = require('../models/product');
const { verifyToken } = require('../middlewares/auth');

const app = express();
const opts = {
    new: true,
    runValidators: true,
    context: 'query' 
};

app.get('/', [verifyToken], (req, res) => {

    logger.info('Get all product');

    let offset = Number(req.query.offset || 0);
    let limit = Number(req.query.limit || 5);

    Product.find({})
        .skip(offset)
        .limit(limit)
        .sort('name')
        .populate('user', 'name email')
        .populate('Category')
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                payload: data
            });
        });
});

app.get('/:id', [verifyToken], (req, res) => {

    logger.info('Get single product');

    Product.findById(req.params.id)
        .populate('user', 'name email')
        .populate('category')
        .exec((err, foundData) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!foundData) {
                return res.status(404).json({
                    ok: false,
                    err: { message: 'Product not found with that ID' }
                });
            }
            return res.json({
                ok: true,
                payload: foundData
            });
        });
});

app.get('/buscar/:search', [verifyToken], (req, res) => {

    logger.info('Find product by name');
    let regex = new RegExp(req.params.search, 'i');

    Product.find({ name: regex })
        .populate('user', 'name email')
        .populate('category')
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!data) {
                return res.status(404).json({
                    ok: false,
                    err: { message: 'Product not found' }
                });
            }
            return res.json({
                ok: true,
                data
            });
        });
});

app.post('/', [verifyToken], (req, res) => {

    logger.info('Post a new product');
    let product = new Product(req.body);
    product.user = req.user._id;
    let err = product.validateSync();

    if (err) {
        return res.status(400).json({
            ok: false,
            err
        });
    }

    product.save((err, savedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        return res.status(201).json({
            ok: true,
            payload: savedData
        });
    });

});

app.put('/:id', [verifyToken], (req, res) => {

    let { id } = req.params;

    Product.findByIdAndUpdate(id, req.body, opts, (err, updatedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!updatedData) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Producto not found with that ID' }
            });
        }
        return res.json({
            ok: true,
            payload: updatedData
        });
    });
});

app.delete('/:id', [verifyToken], (req, res) => {

    Product.findOneAndRemove(req.params.id, (err, deletedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!deletedData) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Producto not found with that ID' }
            });
        }
        return res.json({
            ok: true,
            payload: deletedData
        });
    });
});

module.exports = app;