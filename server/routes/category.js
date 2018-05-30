const express = require('express');
const logger = require('winston');

const Category = require('../models/category');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/', verifyToken, (req, res) => {

    logger.info('Get all categories');

    Category.find({})
        .sort('description')
        .populate('user', 'name email')
        .exec((err, categories) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                payload: categories
            });

        });
});

app.get('/:id', verifyToken, (req, res) => {

    logger.info('Get a category by given ID');
    let { id } = req.params;

    Category.findById(id)
        .exec((err, category) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!category) {
                return res.status(404).json({
                    ok: false,
                    err: { message: 'Does not exists category with that ID' }
                });
            }

            return res.json({
                ok: true,
                payload: category
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

    category.save((err, savedCategory) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: savedCategory
        });
    });

});

app.put('/:id', verifyToken, verifyAdminRole, (req, res) => {

    let body = { description: req.body.description };
    let { id } = req.params;

    Category.findById(id).exec((err, foundCategory) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!foundCategory) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Category not found with that ID' }
            });
        }
        foundCategory.description = body.description;
        foundCategory.save((err, savedCat) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                payload: savedCat
            });
        });
    });
});

app.delete('/:id', verifyToken, verifyAdminRole, (req, res) => {

    let { id } = req.params;

    Category.findOneAndRemove(id, (err, deletedCategory) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!deletedCategory) {
            return res.status(404).json({
                ok: false,
                err: { message: 'Category not found with that ID' }
            });
        }

        return res.json({
            ok: true,
            payload: deletedCategory
        });
    });
});

module.exports = app;