const express = require('express');
const _ = require('underscore');
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

function validateFormForPerformance(form, type) {
  if (type == 'peer') {
    if (!form.utilization-tools) {
      return 'No. 1 is not entered.';
    }
    if (!form.pattern) {
      return 'No. 2 is not entered.';
    }
    if (!form.intra-platform) {
      return 'No. 3 is not entered.';
    }
    if (!form.program-decomposition) {
      return 'No. 4 is not entered.';
    }
    if (!form.system-decomposition) {
      return 'No. 5 is not entered.';
    }
    if (!form.component) {
      return 'No. 6 is not entered.';      
    }
    if (!form.readability) {
      return 'No. 7 is not entered.';
    }
    if (!form.handling) {
      return 'No. 8 is not entered.';
    }
  }

  if (type == 'client') {
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
}

function validateFormForCommunication(form, type) {
  if (type == 'peer') {
    if (!form.easily) {
      return 'No. 1 is not entered.';
    }
    if (!form.describe) {
      return 'No. 2 is not entered.';
    }
    if (!form.explain) {
      return 'No. 3 is not entered.';
    }
    if (!form.details) {
      return 'No. 4 is not entered.';
    }
    if (!form.opinions) {
      return 'No. 5 is not entered.';
    }
  }
  if (type == 'client') {
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
}


router.route('/peer/:id')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const user = req.user;
    // 7일 내에 평가하는 것은 차후 수정하겠음.
    conn.query('SELECT * FROM projects WHERE project_id IN (SELECT project_id FROM assignments WHERE employee_number=?)', [user.employee_number], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const projects = rows;
      console.log(projects);
      res.render('evaluations/forms/peer_evaluation_form', {projects: projects});
    })
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {
    var err = validateFormForPerformance(req.body, 'peer') || validateFormForCommunication(req.body, 'peer');
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

  }))

router.route('/client/:id')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const project_id = req.params.id;
    conn.query('SELECT * FROM projects NATURAL JOIN (SELECT * FROM orders NATURAL JOIN clients) orders_clients WHERE project_id=?', [project_id], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const project = rows[0];
      res.render('evaluations/forms/client_evaluation_form', {project: project});
    })
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {
    var err = validateFormForPerformance(req.body, 'client') || validateFormForCommunication(req.body, 'client');
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    var performanceValue = (req.body.appropriateness + req.body.technology + req.body.development + req.body.fulfillment + req.body.rationality) / 5;
    var communicationValue = (req.body.freedom + req.body.demand + req.body.creative + req.body.stimulat + req.body.opinions) / 5;
    console.log(performanceValue+" "+communicationValue);
  }))

router.route('/pm/:id')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const user = req.user;
    // 동료들 정보도 같이 보내기.
    conn.query('SELECT * FROM projects WHERE pm_number=?', [user.employee_number], (err, rows) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      // console.log(rows);
      var projects = [];
      for (var i = 0; i < rows.length; i++) {
        // projects.push(JSON.parse(JSON.stringify(rows[i])));
        // console.log(projects[0]);
        var project = JSON.parse(JSON.stringify(rows[i]));
        conn.query('SELECT employee_number, name, role FROM employees NATURAL JOIN (SELECT employee_number, role FROM assignments WHERE project_id=?) a', [rows[i].project_id], (err, rows2) => {
          var res = JSON.parse(JSON.stringify(rows2));
          // console.log(res);
          console.log(_.extend(res, project));
          // projects.push(res);
          // console.log(Object.values(JSON.parse(JSON.stringify(rows2))));
        })
      }
      // const projects = JSON.stringify(rows);
      // console.log(projects);
      res.render('evaluations/forms/pm_evaluation_form', {projects: projects});
    })
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {

  }))

module.exports = router;