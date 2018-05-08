const express = require('express');

const app = express();

app.use('/usuario', require('./usuario'));
app.use('/login', require('./login'));

module.exports = app;