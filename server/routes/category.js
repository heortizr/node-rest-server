const express = require('express');

const Category = require('../models/category');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/', verifyToken, (req, res) => {

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

    let { id } = req.params;

    Category.findById(id)
        .exec((err, category) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                payload: category
            });

        });

});

app.post('/', [verifyToken], (req, res) => {

    let { body } = req;

    let category = new Category({
        description: body.description,
        user: req.user._id
    });

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

    Category.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, updatedCategory) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: updatedCategory
        });
    });
});

app.delete('/:id', verifyToken, verifyAdminRole, (req, res) => {

    let { id } = req.params;

    Category.findOneAndRemove(id, (err, deletedCategory) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: deletedCategory
        });
    });
});

module.exports = app;