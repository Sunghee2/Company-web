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
      conn.query('SELECT employee_number, name, dept_name, role, start_date, end_date, project_id FROM assignments NATURAL JOIN (SELECT employee_number, name, dept_name FROM employees NATURAL JOIN departments) e WHERE project_id=?', [project_id],(err, rows2) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');
        }
        const members = JSON.parse(JSON.stringify(rows2));
        res.render('pm/index', {projects: projects, members: members})
      });
    } else {
      res.render('pm/index', {projects: projects});
    }
  });
})

router.get('/client_evaluation', needAuth, (req, res, next)=>{
  conn.query('SELECT s.project_id, project_name, start_date, end_date, client_name, evaluation_id, s.order_id, client_id from (SELECT * FROM (SELECT * FROM projects WHERE pm_number=?) t1 NATURAL JOIN (SELECT client_name, order_id, client_id FROM orders NATURAL JOIN clients) t2) s LEFT JOIN client_evaluations c ON s.project_id=c.project_id WHERE end_date >= CURRENT_TIMESTAMP OR end_date is NULL', [req.user.employee_number], (err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    const projects = rows;
    res.render('pm/client_evaluation', {projects: projects});
  })
})

module.exports = router;