const express = require('express');
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

router.get('/:id', needAuth, (req, res, next) => {
  conn.query('select employee_number, name, email, phone_number, score FROM (employees LEFT JOIN (select be_evaluated_number, round(avg(score),2) score from ((select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from peer_evaluations group by be_evaluated_number) UNION (select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from pm_evaluations group by be_evaluated_number)) t group by be_evaluated_number) a ON employees.employee_number=a.be_evaluated_number) where dept_id =?',[req.params.id], (err, rows)=>{
    if (err) {
      req.flash('danger', err);
      res.redirect('back');
    }
    conn.query('select departments.dept_id, dept_name, dept_manager, name, email, phone_number from departments, employees where dept_manager=employee_number AND departments.dept_id=?', [req.params.id], (err, rows2)=>{
      if (err) {
        req.flash('danger', err);
        res.redirect('back');
      }
      const department = rows2[0];
      const employees = rows;
      res.render('departments/details', {department: department, employees: employees});
    })
  })
})

router.get('/:dept_id/:emp_id', needAuth, (req, res, next) => {
  conn.query('SELECT employee_number, name, dept_id FROM employees WHERE employee_number=?', [req.params.emp_id], (err, rows) => {
    if (err) {
      req.flash('danger', err);
      res.render('back');
    }
    conn.query('SELECT * FROM departments', (err, rows2) => {
      if (err) {
        req.flash('danger', err);
        res.render('back');
      }
      const employee = rows[0];
      const departments = rows2;
      res.render('departments/edit', {employee: employee, departments: departments});
    })
  })
})

router.put('/:id', needAuth, (req, res, next) => {
  const employee_number = req.body.employee_number;
  const dept_id = req.body.department;
  conn.query('UPDATE employees SET dept_id=? WHERE employee_number=?', [dept_id, employee_number], (err, rows) => {
    if (err) {
      req.flash('danger', err);
      res.render('back');
    }
    req.flash('success', 'Updated successfully.');
    res.redirect('/departments');
  })
})

module.exports = router;