const express = require('express');
const catchErrors = require('../lib/async-error');
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
  var name = form.name || "";
  var rrn = form.rrn || "";
  var department = form.department || "";
  var gender = form.gender || "";
  var final_education = form.final_education || "";
  var phone_number = form.phone_number || "";
  
  name = name.trim();
  rrn = rrn.trim();
  department = department.trim();
  final_education = final_education.trim();
  phone_number = phone_number.trim();
  
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

  return null;
}

function validateFormForResetPwd(form) {
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
}

router.route('/')
  .post(catchErrors(async (req, res, next) => {
    var err = validateForm(req.body, 'signup', {needPassword: true});
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    var id = req.body.id;
    var password = req.body.password;
    var employee_number = req.body.employee_number;
    var name = req.body.name;
    var rrn = req.body.rrn;
    var department = req.body.department;
    var gender = req.body.gender;
    var final_education = req.body.final_education;
    var email = req.body.email || "";
    var phone_number = req.body.phone_number;

    conn.query('SELECT * FROM accounts WHERE employee_number=?', [employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      if (!rows.length) {
        bcrypt.hash(password, 10, function(err, hash) {
            var account = [
              employee_number, id, hash
            ];
            var employee = [
              employee_number, name, rrn, department,
              gender, final_education, email, phone_number
            ]
            conn.query('INSERT INTO employees values (?,?,?,?,?,?,?,?)', employee, function(err, rows) {
              if (err) {
                req.flash('danger', err);
                return res.redirect('back');
              }
            })
            conn.query('INSERT INTO accounts values (?,?,?)', account, function(err, rows) {
              if (err) {
                req.flash('danger', err);
                return res.redirect('back');
              }
            })

          })
        } else {
          req.flash('danger', '이미 가입된 사번입니다.');
          return res.redirect('back');
        }
        req.flash('success', 'Registered successfully. Please sign in.');
        res.redirect('/signin');
      })
  }));

router.route('/new')
  .get(function(req, res, next) {
    res.render('users/new');
  })

router.get('/:id/edit', needAuth, catchErrors(async(req, res, next) => {
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
      res.render('users/edit', {user: user});
    }
  })
}))

router.put('/:id', needAuth, catchErrors(async(req, res, next) => {
  var err = validateForm(req.body, 'edit');
  if (err) {
    req.flash('danger', err);
    return res.redirect('back'); 
  }

  req.flash('success', 'Updated successfully.');
  res.redirect('/users');
}))

router.route('/:id/resetPwd')
  .get(needAuth, catchErrors(async(req, res, next) => {
    res.render('users/resetPwd');
  }))
  .put(needAuth, catchErrors(async(req, res, next) => {
    var err = validateFormForResetPwd(req.body);
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    var password = req.body.password;
    var new_password = req.body.new_password;
    var new_password_confirmation = req.body.new_password_confirmation;

    

  }))

module.exports = router;
