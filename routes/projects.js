const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

router.get('/', (req, res, next) => {
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    if (start_date && end_date) {
        conn.query('SELECT project_id, project_name, start_date, end_date, name from (SELECT * FROM projects p, employees e WHERE p.pm_number=e.employee_number) t WHERE end_date <= ? AND start_date >= ?', [end_date, start_date],(err, rows) => {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');  
            }  
            const projects = JSON.parse(JSON.stringify(rows));
            res.render('projects/index', {projects: projects, start_date: start_date, end_date: end_date});
        });
    } else if (start_date) {
        conn.query('SELECT project_id, project_name, start_date, end_date, name from (SELECT * FROM projects p, employees e WHERE p.pm_number=e.employee_number) t WHERE (end_date >= ? OR end_date is NULL) AND start_date >= ?', [start_date, start_date],(err, rows) => {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');  
            }  
            const projects = JSON.parse(JSON.stringify(rows));
            res.render('projects/index', {projects: projects, start_date: start_date});
        });
    } else if (end_date) {
        conn.query('SELECT project_id, project_name, start_date, end_date, name from (SELECT * FROM projects p, employees e WHERE p.pm_number=e.employee_number) t WHERE end_date <= ? AND start_date <= ?', [end_date, end_date],(err, rows) => {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');  
            }  
            const projects = JSON.parse(JSON.stringify(rows));
            res.render('projects/index', {projects: projects, end_date: end_date});
        });
    } else {
        conn.query('SELECT project_id, project_name, start_date, end_date, name from (SELECT * FROM projects p, employees e WHERE p.pm_number=e.employee_number) t WHERE end_date >= CURRENT_TIMESTAMP OR end_date is NULL', (err, rows) => {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');  
            }  
            const projects = JSON.parse(JSON.stringify(rows));
            res.render('projects/index', {projects: projects});
        });
    }
});

router.get('/:id', (req, res, next) => {
    conn.query('SELECT project_id, project_name, start_date, end_date, name, phone_number, order_id, order_details, client_id, client_name from (SELECT * FROM projects p, employees e WHERE p.pm_number=e.employee_number) t1 NATURAL JOIN (SELECT order_id, order_details, client_id, client_name FROM orders NATURAL JOIN clients) t2 WHERE project_id=?', [req.params.id], (err, rows) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');  
        }  
        conn.query('SELECT employee_number, t1.project_id, start_date, end_date, role, name, dept_name, evaluation_id FROM (SELECT * FROM assignments NATURAL JOIN (SELECT employee_number, name, dept_name FROM employees NATURAL JOIN departments) e) t1 LEFT JOIN pm_evaluations t2 ON t1.project_id=t2.project_id AND t1.employee_number=t2.be_evaluated_number WHERE t1.project_id=?', [req.params.id], (err, rows2) => {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');
            }
        
            const project = rows[0];
            const participants = rows2;
            res.render('projects/details', {project: project, participants: participants});
          })
    });   
})

module.exports = router;