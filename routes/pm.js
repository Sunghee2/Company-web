const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/');
  }
}

router.get('/', needAuth, (req, res, next) => {
  const project_id = req.query.project_id;

  conn.query('SELECT * from (SELECT * FROM projects WHERE pm_number=?) t1 NATURAL JOIN (SELECT client_name, order_id FROM orders NATURAL JOIN clients) t2 WHERE end_date >= CURRENT_TIMESTAMP OR end_date is NULL', [req.user.employee_number],(err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');  
    }  
    const projects = rows;
    
    if (project_id) {
      conn.query('SELECT employee_number, name, dept_name, role, start_date, end_date FROM assignments NATURAL JOIN (SELECT employee_number, name, dept_name FROM employees NATURAL JOIN departments) e WHERE project_id=?', [project_id],(err, rows) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');
        }
        const members = rows;
        res.render('pm/index', {projects: projects, members: members})
      });
    } else {
      conn.query('', (err, rows) => {

      });
      res.render('pm/index', {projects: projects});
    }
  });
})

module.exports = router;