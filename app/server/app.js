const express = require('express');
const cors = require('cors');

const app = express();
const routes = require('./routes')(app);

app.use(cors());

module.exports = app;