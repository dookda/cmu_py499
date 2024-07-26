const express = require('express');
const app = express.Router();

app.get('/api', (req, res) => {
    res.send('Hello from api');
});

module.exports = app;