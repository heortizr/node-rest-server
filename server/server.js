require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const usuarioRoutes = require('./routes/usuario');


const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/usuario', usuarioRoutes);

mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;
    console.log(`MongoDB Online`);
});

app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}!`);
});