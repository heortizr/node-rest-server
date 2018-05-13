const express = require('express');
const path = require('path');
const fs = require('fs');
const { verificaToken } = require('../middlewares/auth');

const app = express();

app.get('/:tipo/:img', verificaToken, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = `../../uploads/${tipo}/${img}`;
    let pathNoImg = `../assets/no-image.jpg`;

    let url = path.resolve(__dirname + pathImg);
    let noImg = path.resolve(__dirname, pathNoImg);

    if (fs.existsSync(url)) {
        res.sendFile(url);
    } else {
        res.sendFile(noImg);
    }

});

module.exports = app;