const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();
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

function validateFormForPerformance(form) {
  if (!form.appropriateness) {
    return 'No. 1 is not entered.';
  }
  if (!form.technology) {
    return 'No. 2 is not entered.';
  }
  if (!form.development) {
    return 'No. 3 is not entered.';
  }
  if (!form.fulfillment) {
    return 'No. 4 is not entered.';
  }
  if (!form.rationality) {
    return 'No. 5 is not entered.';
  }
}

function validateFormForCommunication(form) {
  if (!form.freedom) {
    return 'No. 1 is not entered.';
  }
  if (!form.demand) {
    return 'No. 2 is not entered.';
  }
  if (!form.creative) {
    return 'No. 3 is not entered.';
  }
  if (!form.stimulat) {
    return 'No. 4 is not entered.';
  }
  if (!form.opinions) {
    return 'No. 5 is not entered.';
  }
}

router.route('/peer')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const user = req.user;
    // 7일 내에 평가하는 것은 차후 수정하겠음.
    conn.query('SELECT * FROM projects WHERE project_id IN (SELECT project_id FROM assignments WHERE employee_number=?)', [user.employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const projects = rows;
    })
    console.log(projects);
    res.render('evaluations/peer_evaluation_form', {projects: projects});
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {

  }))

router.route('/client')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const user = req.user;
    //project정보와 client 정보 다 있음.
    conn.query('SELECT * FROM projects NATURAL JOIN (SELECT * FROM orders NATURAL JOIN clients) orders_clients WHERE pm_number=?', [user.employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const projects = rows;
    })
    res.render('evaluations/client_evaluation_form', {projects: projects});
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {
    var err = validateFormForPerformance(req.body) || validateFormForCommunication(req.body);
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    var performanceValue = (req.body.appropriateness + req.body.technology + req.body.development + req.body.fulfillment + req.body.rationality)/5;
    var communicationValue = (req.body.freedom + req.body.demand + req.body.creative + req.body.stimulat + req.body.opinions) / 5;
  }))

router.route('/pm')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const user = req.user;
    conn.query('SELECT * FROM projects WHERE pm_number=?', [user.employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const projects = rows;
    })
    res.render('evaluations/pm_evaluation_form', {projects: projects});
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {

  }))

module.exports = router;