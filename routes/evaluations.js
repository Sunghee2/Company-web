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
  if (type == 'pm') {
    if (!form.utilization) {
      return 'No. 1 is not entered.';
    }
    if (!form.pattern) {
      return 'No. 2 is not entered.';
    }
    if (!form.platform) {
      return 'No. 3 is not entered.';
    }
    if (!form.decomposition) {
      return 'No. 4 is not entered.';
    }
    if (!form.system) {
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
}

function validateFormForCommunication(form, type) {
  if (type == 'peer' || type == 'pm') {
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
    const project_id = req.body.project_id;
    const order_id = req.body.order_id;
    var performanceValue = (parseInt(req.body.appropriateness) + parseInt(req.body.technology) + parseInt(req.body.development) + parseInt(req.body.fulfillment) + parseInt(req.body.rationality)) / 5.0;
    var communicationValue = (parseInt(req.body.freedom) + parseInt(req.body.demand) + parseInt(req.body.creative) + parseInt(req.body.stimulat) + parseInt(req.body.opinions)) / 5.0;
    
    conn.query('INSERT INTO client_evaluations(project_id, order_id, performance_score, communication_score) VALUES (?,?,?,?)', [project_id, order_id, performanceValue, communicationValue],(err, rows) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      req.flash('success', '평가를 완료하였습니다.');
      res.redirect('../../pm/client_evaluations');
    })
  }))

router.route('/pm/:project_id/:emp_id')
  .get(needAuth, catchErrors(async(req, res, next) => {
    const project_id = req.params.project_id;
    const employee_number = req.params.emp_id;
    conn.query('SELECT project_id, project_name FROM projects WHERE project_id=?', [project_id], (err, rows) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const project = rows[0];
      conn.query('SELECT employee_number, name, role FROM assignments NATURAL JOIN employees WHERE employee_number=? AND project_id=?', [employee_number, project_id], (err, rows) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');
        }
        const employee = rows[0];
        res.render('evaluations/forms/pm_evaluation_form', {project: project, employee: employee});
      })
    })
  }))
  .post(needAuth, catchErrors(async(req, res, next) => {
    var err = validateFormForPerformance(req.body, 'pm') || validateFormForCommunication(req.body, 'pm');
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }
    const pm_number = req.user.employee_number;
    const project_id = req.body.project_id;
    const be_evaluated_number = req.body.employee_number;
    var performanceValue = (parseInt(req.body.utilization) + parseInt(req.body.pattern) + parseInt(req.body.platform) + parseInt(req.body.decomposition) + parseInt(req.body.system) + parseInt(req.body.component) + parseInt(req.body.readability) + parseInt(req.body.handling)) / 8.0;
    var communicationValue = (parseInt(req.body.easily) + parseInt(req.body.describe) + parseInt(req.body.explain) + parseInt(req.body.details) + parseInt(req.body.opinions)) / 5.0;
    
    conn.query('INSERT INTO pm_evaluations(project_id, pm_number, be_evaluated_number, performance_score, communication_score) VALUES (?,?,?,?,?)', [project_id, pm_number, be_evaluated_number, performanceValue, communicationValue],(err, rows) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      req.flash('success', '평가를 완료하였습니다.');
      res.redirect(`../../../../pm/${project_id}`);
    })
  }));

module.exports = router;