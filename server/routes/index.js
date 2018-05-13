const express = require('express');

const app = express();

app.use('/categoria', require('./categoria'));
app.use('/producto', require('./producto'));
app.use('/usuario', require('./usuario'));
app.use('/login', require('./login'));

module.exports = app;