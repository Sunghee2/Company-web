const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()







router.get('/', function(req, res, next) {

  conn.query('select * from employees ', function(err, rows) {
    if(err) {
        next();
    }  
    console.log(rows);
    res.render('searches/employees', {
        employees:rows
    });
  });
});






module.exports = router;