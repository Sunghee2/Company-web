const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

router.get('/', function(req, res, next) {
    res.render('searches/projects');

});

module.exports = router;