const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
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

//직원 등록 
function validateForm(form, type, options) {
  var rrn = form.rrn || "";
  
  rrn = rrn.trim();

  if (type == 'emp_new') {
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
  }
  return null;
}
router.get('/', (req, res, next) => {
    
  res.render('admin/emp_new');

});

// 직원 등록 
router.get('/emp_new', (req, res, next) => {
    
      res.render('admin/emp_new');
  
});

router.post('/emp_new', needAuth, catchErrors(async(req, res, next) => {
  
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
      console.log(rows,'결과확인@@@@@')
      req.flash('success', 'Updated successfully.');
      res.redirect('/admin');
    })
  }))



/////////////////////////////////////////////////////////////////////////////


  //프로젝트 등록 
 
function validateForm(form, type, options) {
  var project_id = form.project_id || "";
  
  project_id = project_id.trim();

  if (type == 'project_new') {
    var project_name = form.project_name || "";
    var start_date = form.start_date || "";
    var end_date = form.end_date || "";
    var PM_number = form.PM_number || "";
    var order_id = form.order_id || "";
    
    project_name = naproject_nameme.trim();
    start_date = start_date.trim();
    end_date = end_date.trim();
    PM_number = PM_number.trim();
    order_id = order_id.trim();
    
    if (!project_name) {
      return 'project_name is required.';
    }
    
    if (!start_date) {
      return 'start_date is required.';
    }
    
    if (!end_date) {
      return 'end_date is required.';
    }

    if (!PM_number) {
      return 'PM_number is required.';
    }

    if (!order_id) {
      return 'order_id education is required.';
    }
  }
  return null;
}


///////////////////////프로젝트 등록 
router.get('/', (req, res, next) => {
    
  res.render('admin/project_new');

});

// 직원 등록 
router.get('/project_new', (req, res, next) => {
    
      res.render('admin/project_new');
  
});








router.post('admin/project_new', needAuth, catchErrors(async(req, res, next) => {


  var project_id = req.body.project_id;
  var project_name = req.body.project_name;
  var start_date = req.body.start_date;
  var end_date = req.body.end_date;
  var PM_number = req.body.PM_number;
  var order_id = req.body.order_id;
  
  conn.query('INSERT INTO assignments(project_id, project_name, start_date, end_date,PM_number,order_id) VALUES (?,?, curdate(), curdate(),?,?)', [project_id, project_name, start_date, end_date,PM_number,order_id], (err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    req.flash('success', 'Updated successfully.');
    res.redirect('/admin/project_new');
  });
}));

module.exports = router;