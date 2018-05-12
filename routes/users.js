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
  var id = form.name || "";
  // var email = form.email || "";
  id = id.trim();
  // email = email.trim();

  if (!id) {
    return 'ID is required.';
  }

  if (type === 'signup') {
    if (!employee_number) {
      return 'Employee number is required.';
    }
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

  return null;
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.route('/new')
  .get(function(req, res, next) {
    res.render('users/new');
  })
  .post(catchErrors(async (req, res, next) => {
    var err = validateForm(req.body, 'signup', {needPassword: true});
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    var id = req.body.id;
    var password = req.body.password;
    var employee_number = req.body.employee_number;
    var email = req.body.email || "";

    conn.query('SELECT * FROM accounts WHERE employee_number=?', [employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }

      if (rows.length) {
        bcrypt.hash(password, null, null, function(err, hash) {
            var account = {id: id, password: hash, employee_number: employee_number};
            conn.query('INSERT INTO accounts set ?', account, function(err, rows) {
              if (err) {
                req.flash('danger', err);
                return res.redirect('back');
              }
              req.flash('success', 'Registered successfully. Please sign in.');
              res.redirect('/signin');
            })
        })
        conn.query('')
      } else {
        req.flash('danger', '이미 가입된 사번입니다.');
        return res.redirect('back');
      }
    })
  
  // var account = {
  //             'id': req.body.id,
  //             'password': req.body.password,
  //             'employee_number': req.body.employee_number
  //           }

  // var employee = {
  //             'employee_number': req.body.employee_number,
  //             'g': req.body.,
  //             '': req.body.email,
  //             '': req.body.}

}));

router.get('/:id/edit', needAuth, catchErrors(async(req, res, next) => {
  conn.query('SELECT * FROM accounts WHERE `id`=?', [req.paramsid], function(err, rows) {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');     
    }
    const user = rows[0];
    res.render('users/edit', {user: user});
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

module.exports = router;
