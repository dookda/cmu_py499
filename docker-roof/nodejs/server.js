const express = require('express');
const app = express();

const axios = require('axios');

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

app.listen(3000, () => {
    console.log('running on http://localhost:3000')
});

app.use('/', express.static('www'));

const api = require('./service/api');
app.use(api);
