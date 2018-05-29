const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

function validateForm(form, type, options) {
  var rrn = form.rrn || "";
  
  rrn = rrn.trim();

  if (type === 'signup') {
    var id = form.id || "";
    var employee_number = form.employee_number || "";
    id = id.trim();
    employee_number = employee_number.trim();
    
    if (!id) {
      return 'ID is required.';
    }
    if (!employee_number) {
      return 'Employee number is required.';
    }
    if (!form.password && options.needPassword) {
      return 'Password is required.';
    }
    
    if (form.password !== form.password_confirmed) {
      return 'Passsword do not match.';
    }
    
    if (form.password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
  }
  if (type == 'edit') {
    var name = form.name || "";
    var gender = form.gender || "";
    var department = form.department || "";
    var final_education = form.final_education || "";
    var phone_number = form.phone_number || "";
    
    name = name.trim();
    final_education = final_education.trim();
    phone_number = phone_number.trim();
    
    if (!name) {
      return 'Name is required.';
    }
    
    if (!rrn) {
      return 'RRN is required.';
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
  }
  return null;
}

function validateFormForChangePwd(form) {
  if (!form.password) {
    return 'Current Password is required.';
  }

  if (!form.new_password) {
    return 'New Password is required.';
  }

  if (!form.new_password_confirmation) {
    return 'New Password Confirmation is required.';
  }

  if (form.new_password.length < 6) {
    return 'New Password must be at least 6 characters.';
  }

  if (form.new_password !== form.new_password_confirmation) {
    return 'New Passsword do not match.';
  }

  return null;
}

router.route('/')
  .post((req, res, next) => {
    var err = validateForm(req.body, 'signup', {needPassword: true});
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    var id = req.body.id;
    var password = req.body.password;
    var employee_number = req.body.employee_number;
    var rrn = req.body.rrn;
    conn.query('SELECT * FROM accounts WHERE employee_number=?', [employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      if (rows.length <= 0) {
        conn.query('SELECT * FROM accounts WHERE id=?', [id], (err, rows3) => {
          if (err) {
            req.flash('danger', err);
            return res.redirect('back');           
          }
          if (rows3.length <= 0) {
            conn.query('SELECT * FROM employees WHERE employee_number=?', [employee_number], (err, rows2) => {
              if (err) {
                req.flash('danger', err);
                return res.redirect('back');
              }
              if (rows2.length) {
                if (rows2[0].RRN != rrn) {
                  req.flash('danger', 'RRN이 올바르지 않습니다');
                  return res.redirect('back');
                } else {
                  bcrypt.hash(password, 10, function(err, hash) {
                    var account = [
                      employee_number, id, hash
                    ];
                    conn.query('INSERT INTO accounts values (?,?,?)', account, (err, rows4) => {
                      if (err) {
                        req.flash('danger', err);
                        return res.redirect('back');
                      }
                      req.flash('success', 'Registered successfully. Please sign in.');
                      return res.redirect('/signin');
                    });
                  })
                }
              } else {
                req.flash('danger', '존재하지 않는 사번입니다.');
                return res.redirect('back');
              }
            })
          } else {
            req.flash('danger', '이미 존재하는 아이디입니다. 다른 아이디를 입력해주세요');
            return res.redirect('back');
          }
        })
      } else {
          req.flash('danger', '이미 가입된 사번입니다.');
          return res.redirect('back');
        }
      })
  });

router.route('/new')
  .get(function(req, res, next) {
    res.render('users/new');
  })

router.get('/:id/edit', needAuth, (req, res, next) => {
  conn.query('SELECT * FROM employees WHERE employee_number=?', [req.params.id], function(err, rows) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');     
    }
    if (!rows.length) {
      req.flash('danger', '잘못된 접근입니다.');
      return res.redirect('back');
    } else {
      const user = rows[0];
      conn.query('SELECT dept_id, dept_name FROM departments', (err, rows2) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');
        }
        conn.query('select skill_name, skill_rank from emp_skill NATURAL JOIN skill_sets where employee_number=?', [req.params.id], (err, rows3)=> {
          if (err) {
            req.flash('danger', err);
            return res.redirect('back');  
          } 
          const departments = rows2;
          const skills = rows3;
        res.render('users/edit', {user: user, departments: departments, skills:skills});
      });
    })
  }})
});

router.put('/:id', needAuth, (req, res, next) => {
  var err = validateForm(req.body, 'edit');
  if (err) {
    req.flash('danger', err);
    return res.redirect('back'); 
  }

  var employee_number = req.params.id;
  var name = req.body.name;
  var rrn = req.body.rrn;
  var department = req.body.department;
  var gender = req.body.gender;
  var final_education = req.body.final_education;
  var email = req.body.email || "";
  var phone_number = req.body.phone_number;

  conn.query('UPDATE employees SET name=?, rrn=?, dept_id=?, gender=?, final_education=?, email=?, phone_number=? where employee_number=?',
    [name, rrn, department, gender, final_education, email, phone_number, employee_number], function(err, rows) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    req.flash('success', 'Updated successfully.');
    res.redirect('/');
  })
})

router.route('/:id/changePwd')
  .get(needAuth, (req, res, next) => {
    res.render('users/changePwd');
  })
  .put(needAuth, (req, res, next) => {
    var err = validateFormForChangePwd(req.body);
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    var password = req.body.password;
    var new_password = req.body.new_password;
    var new_password_confirmation = req.body.new_password_confirmation;

    conn.query('SELECT * FROM accounts WHERE employee_number=?', [req.params.id], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      if (rows.length == 0) {
        req.flash('danger', '잘못된 접근입니다.');
        return res.redirect('back');
      }
      var user = rows[0];
      if(!bcrypt.compareSync(password, user.password)) {
        req.flash('danger', '비밀번호가 올바르지 않습니다.');
        return res.redirect('back');
      } else {
        bcrypt.hash(new_password, 10, function(err, hash) {
          conn.query('UPDATE accounts SET password=? WHERE employee_number=?', [hash, req.params.id], function(err, rows) {
            if (err) {
              req.flash('danger', err);
              return res.redirect('back');
            }
            if (rows.length !== 0) {
              req.flash('success', 'Updated successfully.');
              res.redirect('/');
            } else {
              req.flash('danger', '변경에 실패하였습니다.');
              res.redirect('back');
            }
          })
        })
      }
    })
  });

router.get('/:id/skills', (req, res, next) => {
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
      const skills = rows2;
      res.render('users/skills', {skills: skills});
    })
  })
});

router.route('/:id/newSkills')
  .get(needAuth, (req, res, next) => {
    res.render('users/newSkills');
  })
  .post(needAuth, (req, res, next) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    var id = req.body.id;
    var password = req.body.password;
    var skill = [
      req.body.skill, req.params.id
    ];
    conn.query('INSERT INTO emp_skills(skill_id, employee_number) values (?,?)', skill, (err, rows3) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      req.flash('success', 'success');
      return res.redirect('back');
    });
});
     
module.exports = router;
