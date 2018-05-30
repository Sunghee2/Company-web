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

function validateForm(form) {
  var rrn = form.rrn || "";
  
  rrn = rrn.trim();

  var name = form.name || "";
  var gender = form.gender || "";
  var department = form.dept_id || "";
  var final_education = form.final_education || "";
  var phone_number = form.phone_number || "";
  
  name = name.trim();
  gender = gender.trim();
  department = department.trim();
  final_education = final_education.trim();
  phone_number = phone_number.trim();
  
  if (!name) {
    return 'Name is required.';
  }
  if (!department) {
    return 'Department is required.';
  }

  if (!gender) {
    return 'Gender is required.';
  }

  if (!final_education) {
    return 'Final education is required.';
  }

  if (!phone_number) {
    return 'Phone number is required.';
  }
  
  return null;
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

router.get('/new', (req, res, next) => {
  res.render('employees/new');
});


router.post('/new', needAuth, (req, res, next) => {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  var name = req.body.name;
  var rrn = req.body.rrn;
  var department = req.body.dept_id;
  var gender = req.body.gender;
  var final_education = req.body.final_education;
  var email = req.body.email || "";
  var phone_number = req.body.phone_number;
  
 conn.query('INSERT INTO employees(name, rrn, dept_id, gender, final_education, email, phone_number) VALUES(?,?,?,?,?,?,?)',
 [name, rrn, department, gender, final_education, email, phone_number], function(err, rows) {
    if (err)  throw(err);

    req.flash('success', 'Updated successfully.');
    res.redirect('/employees');
  })
})

router.get('/:id', (req, res, next) => {
  conn.query('select * from  employees NATURAL JOIN departments WHERE employee_number=? ' , [req.params.id] ,function(err, rows) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');  
    }  
    conn.query('select skill_name, rank from emp_skill NATURAL JOIN skill_sets where employee_number=?', [req.params.id], (err, rows2)=> {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');  
      } 
      conn.query('select career, period_start, period_end from careers where employee_number=?', [req.params.id], (err, rows3) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');  
        } 
        conn.query('select pjts.project_id, pjts.project_name, clnt.performance_score as client_performance_score, clnt.communication_score as client_communication_score, round(peer.performance_score,2) as peer_performance_score, round(peer.communication_score,2) as peer_communication_score, round(pjtm.performance_score,2) as pm_performance_score, round(pjtm.communication_score,2) as pm_communication_score from projects pjts natural join assignments asmt left join client_evaluations clnt on pjts.project_id = clnt.project_id left join (select evaluation_id, project_id, evaluator_number, be_evaluated_number, avg(performance_score) performance_score, avg(communication_score) communication_score from peer_evaluations group by be_evaluated_number) peer on asmt.employee_number = peer.be_evaluated_number left join (select	evaluation_id, project_id, pm_number, be_evaluated_number, avg(performance_score) performance_score, avg(communication_score) communication_score from pm_evaluations group by be_evaluated_number) pjtm on asmt.employee_number = pjtm.be_evaluated_number where asmt.employee_number=?', [req.params.id], (err, rows4) => {
          if (err) {
            req.flash('danger', err);
            return res.redirect('back');  
          }
          if(!rows4){
            rows4 = ['null', null, null, null, null, null, null, null];
          }
          conn.query('SELECT t1.project_id, project_name, t2.start_date, role FROM projects t1, assignments t2 WHERE t1.project_id=t2.project_id AND (DATE_ADD(t1.end_date, INTERVAL 7 DAY) >= CURRENT_DATE OR t2.end_date is NULL) AND employee_number=?',[req.params.id], (err, rows5) => {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');
            }
            const employee = rows[0];
            const skills = rows2;
            const careers = rows3;
            const projects = rows4;
            const cur_projects = rows5;
            res.render('employees/details', {employee: employee, skills: skills, careers: careers, projects:projects, cur_projects: cur_projects});
          })
        })
      })
    })
  })
});

router.get('/:id/newEmpSkills', (req, res, next) => {
  res.render('employees/newEmpSkills');
});

router.post('/:id/newEmpSkills', needAuth, (req, res, next) => {
  var id = req.params.id;
  var skill = req.body.skill;
  var rank = req.body.rank;
  var skill_info = [
    skill, id, rank
  ];
  conn.query('INSERT INTO emp_skill(skill_id, employee_number, rank) values (?,?,?)', skill_info, (err, rows2) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    req.flash('success', 'Updated successfully.');
    res.redirect('/employees');
  })
});


module.exports = router;