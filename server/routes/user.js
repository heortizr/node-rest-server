const bcrypt = require('bcrypt');
const express = require('express');
const logger = require('winston');

const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();
const opts = {
    new: true,
    runValidators: true,
    context: 'query' 
};

app.get('/', [verifyToken], (req, res) => {

    logger.info('Get all users');

    let offset = Number(req.query.offset || 0);
    let limit = Number(req.query.limit || 5);

    User.find({ estado: true }, 'name email img status role google')
        .skip(offset)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            User.count({ estado: true }, (err, total) => {
                return res.json({
                    ok: true,
                    payload: { total, users: data }
                });
            });
        });
});

app.get('/:id', [verifyToken], (req, res) => {

    logger.info('Get a single user');
    
    User.findById(req.params.id, (err, foundData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!foundData) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'User does not exists'
                }
            });
        }
        return res.json({
            ok: true,
            payload: foundData
        });
    });
});

app.post('/', (req, res) => {

    logger.info('Post a new user');
    let user = new User(req.body);
    let err = user.validateSync();

    if (err) {
        return res.status(400).json({
            ok: false,
            err
        });
    }

    user.password = bcrypt.hashSync(req.body.password, 10);
    user.save((err, savedData) => {
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

app.put('/:id', [verifyToken, verifyAdminRole], (req, res) => {

    logger.info('Put a user');    
    User.findByIdAndUpdate(req.params.id, {$set: req.body}, opts, (err, updatedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!updatedData) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'User does not exists'
                }
            });
        }
        return res.json({
            ok: true,
            payload: updatedData
        });
    });
});

app.delete('/:id', [verifyToken, verifyAdminRole], (req, res) => {

    logger.info('Delete a user (update status field)');

    User.findByIdAndUpdate(req.params.id, {status: false}, opts, (err, updatedData) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!updatedData) {
            return res.status(404).json({
                ok: false,
                err: { message: 'User not found' }
            });
        }
        return res.json({
            ok: true,
            payload: updatedData
        });
    });
});

module.exports = app;