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
  const employee_number = req.query.employee_number;
  const name = req.query.name;
  
  if (employee_number && name) {
    conn.query('select employee_number, name, email, phone_number, dept_name, score FROM (employees LEFT JOIN (select be_evaluated_number, round(avg(score),2) score from ((select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from peer_evaluations group by be_evaluated_number) UNION (select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from pm_evaluations group by be_evaluated_number)) t group by be_evaluated_number) a ON employees.employee_number=a.be_evaluated_number) NATURAL JOIN departments WHERE employee_number LIKE ? AND name LIKE ?', ['%'+employee_number+'%', '%'+name+'%'],function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees, employee_number: employee_number, name: name});
    });
  } else if (employee_number) {
    conn.query('select employee_number, name, email, phone_number, dept_name, score FROM (employees LEFT JOIN (select be_evaluated_number, round(avg(score),2) score from ((select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from peer_evaluations group by be_evaluated_number) UNION (select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from pm_evaluations group by be_evaluated_number)) t group by be_evaluated_number) a ON employees.employee_number=a.be_evaluated_number) NATURAL JOIN departments WHERE employee_number LIKE ?', ['%'+employee_number+'%'],function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees, employee_number: employee_number});
    });
  } else if (name) {
    conn.query('select employee_number, name, email, phone_number, dept_name, score FROM (employees LEFT JOIN (select be_evaluated_number, round(avg(score),2) score from ((select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from peer_evaluations group by be_evaluated_number) UNION (select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from pm_evaluations group by be_evaluated_number)) t group by be_evaluated_number) a ON employees.employee_number=a.be_evaluated_number) NATURAL JOIN departments WHERE name LIKE ?', ['%'+name+'%'],function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      }  
      const employees = JSON.parse(JSON.stringify(rows));
      res.render('employees/index', {employees: employees, name: name});
    });
  } else {
    conn.query('select employee_number, name, email, phone_number, dept_name, score FROM (employees LEFT JOIN (select be_evaluated_number, round(avg(score),2) score from ((select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from peer_evaluations group by be_evaluated_number) UNION (select be_evaluated_number, (avg(performance_score)+avg(communication_score))/2 score from pm_evaluations group by be_evaluated_number)) t group by be_evaluated_number) a ON employees.employee_number=a.be_evaluated_number) NATURAL JOIN departments', function(err, rows) {
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
  conn.query('select * from  employees NATURAL JOIN departments WHERE employee_number=? ' , [req.params.id] ,function(err, rows) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');  
    }  
    conn.query('select skill_name, skill_rank from emp_skill NATURAL JOIN skill_sets where employee_number=?', [req.params.id], (err, rows2)=> {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      } 
      conn.query('select career, period_start, period_end from careers where employee_number=?', [req.params.id], (err, rows3) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');  
        } 
        conn.query('select pjts.project_name, clnt.performance_score as client_performance_score, clnt.communication_score as client_communication_score, round(peer.performance_score,2) as peer_performance_score, round(peer.communication_score,2) as peer_communication_score, pjtm.performance_score as pm_performance_score, pjtm.communication_score as pm_communication_score from projects pjts natural join assignments asmt join client_evaluations clnt join (select evaluation_id, project_id, evaluator_number, be_evaluated_number, avg(performance_score) performance_score, avg(communication_score) communication_score from peer_evaluations group by be_evaluated_number) peer join (select	evaluation_id, project_id, pm_number, be_evaluated_number, avg(performance_score) performance_score, avg(communication_score) communication_score from pm_evaluations group by be_evaluated_number) pjtm where pjts.project_id = clnt.project_id and asmt.employee_number = peer.be_evaluated_number and asmt.employee_number = pjtm.be_evaluated_number and asmt.employee_number=?', [req.params.id], (err, rows4) => {
          if (err) {
            req.flash('danger', err);
            return res.redirect('back');  
          }
          if(!rows4){
            rows4 = ['null', null, null, null, null, null, null, null];
          }
          const employee = rows[0];
          const skills = rows2;
          const careers = rows3;
          const projects = rows4;
          res.render('employees/details', {employee: employee, skills: skills, careers: careers, projects:projects});
        })
      })
    })
  })
});


module.exports = router;