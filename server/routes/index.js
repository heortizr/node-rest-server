const express = require('express');

const app = express();

app.use('/category', require('./category'));
app.use('/product', require('./product'));
app.use('/upload', require('./upload'));
app.use('/image', require('./image'));
app.use('/login', require('./login'));
app.use('/user', require('./user'));

module.exports = app;