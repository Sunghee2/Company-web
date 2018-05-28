const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

function needAuth(req, res, next) {
  if (req.isAuthenticated()) {
    conn.query('SELECT * FROM assignments WHERE employee_number=? AND role="PM" AND (end_date+7 >= CURRENT_DATE OR end_date is NULL)', [req.user.employee_number], (err, rows) => {
      if (!rows.length) {
        req.flash('danger', '접근 권한이 없습니다.');
        return res.redirect('back');
      } else {
        next();
      }
    })
  } else {
    req.flash('danger', 'Please signin first.');
    res.redirect('/');
  }
}

function validateForm(form) {
  var employee_number = form.employee_number || "";
  var name = form.name || "";
  var role = form.role || "";

  if (!employee_number) {
    return 'Employee Number is required.';
  }
  if (!name) {
    return 'Name is required.';
  }
  if (!role) {
    return 'Role is required.';
  }
}

router.get('/', needAuth, (req, res, next) => {
  const project_id = req.query.project_id;

  conn.query('SELECT * from (SELECT * FROM projects WHERE pm_number=?) t1 NATURAL JOIN (SELECT client_name, order_id FROM orders NATURAL JOIN clients) t2 WHERE end_date+7 >= CURRENT_DATE OR end_date is NULL', [req.user.employee_number],(err, rows) => {
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

router.get('/client_evaluations', needAuth, (req, res, next) => {
  conn.query('SELECT s.project_id, project_name, start_date, end_date, client_name, evaluation_id, s.order_id, client_id from (SELECT * FROM (SELECT * FROM projects WHERE pm_number=?) t1 NATURAL JOIN (SELECT client_name, order_id, client_id FROM orders NATURAL JOIN clients) t2) s LEFT JOIN client_evaluations c ON s.project_id=c.project_id WHERE end_date+7 >= CURRENT_DATE OR end_date is NULL', [req.user.employee_number], (err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    const projects = rows;
    res.render('pm/client_evaluation', {projects: projects});
  })
})

router.get('/:id', needAuth, (req, res, next) => {
  conn.query('SELECT employee_number, t1.project_id, start_date, end_date, role, name, dept_name, evaluation_id FROM (SELECT * FROM assignments NATURAL JOIN (SELECT employee_number, name, dept_name FROM employees NATURAL JOIN departments) e) t1 LEFT JOIN pm_evaluations t2 ON t1.project_id=t2.project_id AND t1.employee_number=t2.be_evaluated_number WHERE t1.project_id=?', [req.params.id], (err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    const participants = rows;
    res.render('pm/project_details', {participants: participants})
  })
});

router.route('/:project_id/:emp_id')
  .post(needAuth, (req, res, next) => {
    console.log("please");
    var err = validateForm(req.body);
    if (err) {
      req.flash('danger', err);
      res.redirect('back');
    }
    const project_id = req.params.project_id;
    const employee_number = req.body.employee_number;
    const name = req.body.employee_name;
    const role = req.body.role;

    conn.query('INSERT INTO assignments(project_id, employee_number, start_date, role) VALUES (?,?, curdate(),?)', [project_id, employee_number, role], (err, rows) => {
      if (err) {
        req.flash('danger', err);
        res.redirect('back');
      }

      req.flash('success', '성공적으로 추가하였습니다.');
      res.redirect(`../../pm/${project_id}`);
    });
  })
  .put(needAuth, (req, res, next) => {
    const project_id = req.params.project_id;
    const employee_number = req.params.emp_id;
    conn.query('update assignments set end_date = current_date() where project_id=? AND employee_number=?', [project_id, employee_number], (err, rows) => {
      if (err) {
        req.flash('danger', err);
        res.redirect('back');
      }
      req.flash('success', '성공적으로 삭제하였습니다.');
      res.redirect(`../../pm/${project_id}`);
    })
  })

// router.get('/pm_evaluations', needAuth, (req, res, next) => {
//   conn.query('', [req.user.employee_number], (err, rows) => {
//     if (err) {
//       req.flash('danger', err);
//       return res.redirect('back');
//     }

//     const projects = rows;
//     res.render('pm/client_evaluation', {projects: projects});
//   })
// })

module.exports = router;