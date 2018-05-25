const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    const user = req.user;
    if (user.manager || user.dept_id == 801001) {
      next();
    } else {
      req.flash('danger', '접근 권한이 없습니다');
      res.redirect('/');
    }
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/');
  }
}

router.get('/', needAuth, (req, res, next) => {
  conn.query('SELECT * FROM departments', (err, rows) => {
    if (err) {
      req.flash('danger', err);
      res.redirect('back');
    }

    const departments = rows;
    res.render('departments/index', {departments: departments});
  })
})


module.exports = router;