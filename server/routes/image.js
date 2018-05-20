const express = require('express');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middlewares/auth');

const app = express();

app.get('/:type/:img', verifyToken, (req, res) => {

    let { type, img } = req.params;

    let pathImg = `../../uploads/${type}/${img}`;
    let pathNoImg = '../assets/no-image.jpg';

    let url = path.resolve(__dirname + pathImg);
    let noImg = path.resolve(__dirname, pathNoImg);

    if (fs.existsSync(url)) {
        res.sendFile(url);
    } else {
        res.sendFile(noImg);
    }

});

module.exports = app;