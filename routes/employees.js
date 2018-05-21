const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

router.get('/', (req, res, next) => {
  const employee_number = req.query.employee_number;
  const name = req.query.name;
  
  if (employee_number && name) {
    conn.query('SELECT employee_number, name, email, phone_number, dept_name FROM employees NATURAL JOIN departments WHERE employee_number LIKE ? AND name LIKE ?', ['%'+employee_number+'%', '%'+name+'%'],function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees, employee_number: employee_number, name: name});
    });
  } else if (employee_number) {
    conn.query('SELECT employee_number, name, email, phone_number, dept_name FROM employees NATURAL JOIN departments WHERE employee_number LIKE ?', ['%'+employee_number+'%'],function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees, employee_number: employee_number});
    });
  } else if (name) {
    conn.query('SELECT employee_number, name, email, phone_number, dept_name FROM employees NATURAL JOIN departments WHERE name LIKE ?', ['%'+name+'%'],function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees, name: name});
    });
  } else {
    conn.query('SELECT employee_number, name, email, phone_number, dept_name FROM employees NATURAL JOIN departments', function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees});
    });
  }
});

router.get('/:id', (req, res, next) => {
  conn.query('SELECT * FROM employees NATURAL JOIN departments WHERE employee_number=?', [req.params.id],function(err, rows) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');  
    }  
    const employee = rows[0];
    res.render('employees/details', {employee: employee});
  });
})






module.exports = router;