require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// parser de body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cargo las rutas
require('./routes/index');

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;
    console.log(`MongoDB Online`);
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`);
});