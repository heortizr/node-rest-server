require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const mongoose = require('mongoose');
const logger = require('winston');
const path = require('path');

const app = express();

// parser de body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// middleware to make public static files
app.use(express.static(path.resolve(__dirname, '../public')));

// load routes
app.use(routes);

mongoose.connect(process.env.URLDB, (err) => {
    if (err) throw err;
    logger.info('MongoDB Online');
});

app.listen(process.env.PORT, () => {
    logger.info(`App listening on port ${process.env.PORT}!`);
});

module.exports = app;