const express = require('express');
const logger = require('winston');

const Category = require('../models/category');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();
const opts = {
    new: true,
    runValidators: true,
    context: 'query' 
};

app.get('/', verifyToken, (req, res) => {

    logger.info('Get all categories');

    Category.find({})
        .sort('description')
        .populate('user', 'name email')
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

app.get('/:id', verifyToken, (req, res) => {

    logger.info('Get a category by given ID');

    Category.findById(req.params.id, (err, foundData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!foundData) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Does not exists category with that ID' }
            });
        }
        return res.json({
            ok: true,
            payload: foundData
        });
    });
});

app.post('/', [verifyToken], (req, res) => {

    logger.info('Post a new category');

    let category = new Category({
        description: req.body.description,
        user: req.user._id
    });

    let err = category.validateSync();
    if (err) {
        return res.status(400).json({
            ok: false,
            err
        });
    }

    category.save((err, savedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        return res.json({
            ok: true,
            payload: savedData
        });
    });

});

app.put('/:id', verifyToken, verifyAdminRole, (req, res) => {

    let body = { description: req.body.description };

    Category.findByIdAndUpdate(req.params.id, body, opts, (err, updatedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!updatedData) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Category not found with that ID' }
            });
        }
        return res.json({
            ok: true,
            payload: updatedData
        });
    });
});

app.delete('/:id', verifyToken, verifyAdminRole, (req, res) => {

    let { id } = req.params;

    Category.findOneAndRemove(id, (err, deletedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!deletedData) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Category not found with that ID' }
            });
        }
        return res.json({
            ok: true,
            payload: deletedData
        });
    });
});

module.exports = app;