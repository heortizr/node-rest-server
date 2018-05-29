const bcrypt = require('bcrypt');
const express = require('express');
const logger = require('winston');
const _ = require('underscore');

const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/', [verifyToken], (req, res) => {

    logger.info('Get all users');

    let from = Number(req.query.from || 0);
    let limit = Number(req.query.limit || 5);

    User.find({ estado: true }, 'name email img status role google')
        .skip(from)
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

app.post('/', (req, res) => {

    logger.info('Post a new user');

    if (!req.body.password) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Field password is required'
            }
        });
    }

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password || '', 10),
        role: req.body.role
    });

    user.save((err, savedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: savedUser
        });
    });

});

app.put('/:id', [verifyToken, verifyAdminRole], (req, res) => {

    logger.info('Put a user');
    
    let flieds = ['name', 'email', 'password', 'img', 'role', 'status'];
    let body = _.pick(req.body, flieds);
    let { id } = req.params;
    
    logger.info(id);
    logger.info(body);

    User.findById(id, (err, foundUser) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!foundUser) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'User does not exists'
                }
            });
        }

        foundUser.name = body.name;
        foundUser.email = body.email;
        foundUser.img = body.img;
        foundUser.role = body.role;
        foundUser.status = body.status;

        foundUser.save((err, savedUser) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                payload: savedUser
            });
        });
    });

});

app.delete('/:id', [verifyToken, verifyAdminRole], (req, res) => {

    logger.info('Delete a user');

    let { id } = req.params;
    let body = { status: false };

    User.findByIdAndUpdate(id, body, { new: true }, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!deletedUser) {
            return res.status(404).json({
                ok: false,
                err: { err: 'User not found' }
            });
        }

        return res.json({
            ok: true,
            payload: deletedUser
        });
    });
});

module.exports = app;