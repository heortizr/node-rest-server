const bcrypt = require('bcrypt');
const express = require('express');
const _ = require('underscore');

const User = require('../models/user');
const { verifyToken, verifyAdminRole } = require('../middlewares/auth');

const app = express();

app.get('/', [verifyToken], (req, res) => {

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

app.post('/', [verifyToken, verifyAdminRole], (req, res) => {

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
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

    let flieds = ['name', 'email', 'password', 'img', 'role', 'status'];
    let body = _.pick(req.body, flieds);
    let { id } = req.params;

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, updatedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: updatedUser
        });
    });
});

app.delete('/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let { id } = req.params;
    let body = { estado: false };

    User.findByIdAndUpdate(id, body, { new: true }, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        return res.json({
            ok: true,
            payload: deletedUser
        });
    });
});

module.exports = app;