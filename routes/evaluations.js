const express = require('express');
const _ = require('underscore');
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

function needManagerAuth(req, res, next) {
  if (req.isAuthenticated()) {
    const user = req.user;
    if (user.dept_id == 801001) {
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

function validateFormForPerformance(form, type) {
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
  if (type == 'pm' || type == 'peer') {
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

router.get('/list', needAuth, (req, res, next) => {
  conn.query('SELECT * FROM ((select be_evaluated_number employee_number, peer1, peer2, pm1, pm2, client1, client2 from ((select peer_evaluations.be_evaluated_number, avg(peer_evaluations.performance_score) peer1,avg(peer_evaluations.communication_score) peer2, pm1, pm2 from peer_evaluations LEFT JOIN (SELECT p.be_evaluated_number, avg(performance_score) pm1, avg(communication_score) pm2 FROM pm_evaluations p group by p.be_evaluated_number) e ON peer_evaluations.be_evaluated_number=e.be_evaluated_number group by peer_evaluations.be_evaluated_number) UNION (select pm_evaluations.be_evaluated_number, peer1, peer2, avg(pm_evaluations.performance_score) pm1, avg(pm_evaluations.communication_score) pm2 from (SELECT r.be_evaluated_number, avg(r.performance_score) peer1, avg(r.communication_score) peer2 FROM peer_evaluations r group by r.be_evaluated_number) t2 RIGHT JOIN pm_evaluations ON t2.be_evaluated_number=pm_evaluations.be_evaluated_number group by pm_evaluations.be_evaluated_number)) tt LEFT JOIN (select employee_number, avg(performance_score) client1, avg(communication_score) client2 from assignments LEFT JOIN client_evaluations ON assignments.project_id=client_evaluations.project_id group by employee_number) ttt ON tt.be_evaluated_number=ttt.employee_number) UNION (select employee_number, peer1, peer2, pm1, pm2, client1, client2 from ((select peer_evaluations.be_evaluated_number, avg(peer_evaluations.performance_score) peer1,avg(peer_evaluations.communication_score) peer2, pm1, pm2 from peer_evaluations LEFT JOIN (SELECT p.be_evaluated_number, avg(performance_score) pm1, avg(communication_score) pm2 FROM pm_evaluations p group by p.be_evaluated_number) e ON peer_evaluations.be_evaluated_number=e.be_evaluated_number group by peer_evaluations.be_evaluated_number) UNION (select pm_evaluations.be_evaluated_number, peer1, peer2, avg(pm_evaluations.performance_score) pm1, avg(pm_evaluations.communication_score) pm2 from (SELECT r.be_evaluated_number, avg(r.performance_score) peer1, avg(r.communication_score) peer2 FROM peer_evaluations r group by r.be_evaluated_number) t2 RIGHT JOIN pm_evaluations ON t2.be_evaluated_number=pm_evaluations.be_evaluated_number group by pm_evaluations.be_evaluated_number)) ww RIGHT JOIN (select employee_number, avg(performance_score) client1, avg(communication_score) client2 from assignments LEFT JOIN client_evaluations ON assignments.project_id=client_evaluations.project_id group by employee_number) www ON ww.be_evaluated_number=www.employee_number)) ds ORDER BY employee_number', (err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');      
    }
    const evaluations = rows;
    res.render('evaluations/index', {evaluations: evaluations});
  })
})

router.get('/client', needManagerAuth, (req, res, next) => {
  conn.query('SELECT t3.project_id, project_name, start_date, end_date, client_name, evaluation_id, t3.order_id, client_id from (SELECT * FROM projects t1 NATURAL JOIN (SELECT client_name, order_id, client_id FROM orders NATURAL JOIN clients) t2) t3 LEFT JOIN client_evaluations t4 ON t3.project_id=t4.project_id WHERE (DATE(DATE_ADD(end_date, INTERVAL 7 DAY))>=CURRENT_DATE OR end_date is NULL)', (err, rows) => {
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    const projects = rows;
    res.render('evaluations/client_evaluation_list', {projects: projects});
  })
})

router.route('/peer/:project_id/:emp_id')
  .get(needAuth, (req, res, next) => {
    const project_id = req.params.project_id;
    const be_evaluated_number = req.params.emp_id;
    conn.query('SELECT project_id, project_name FROM projects WHERE project_id=?', [project_id], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      conn.query('SELECT employee_number, name, role FROM assignments NATURAL JOIN employees WHERE employee_number=? AND project_id=?', [be_evaluated_number, project_id], (err, rows2) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');
        }
        const project = rows[0];
        const employee = rows2[0];
        res.render('evaluations/forms/peer_evaluation_form', {project: project, employee: employee});
      })
    })
  })
  .post(needAuth, (req, res, next) => {
    var err = validateFormForPerformance(req.body, 'peer') || validateFormForCommunication(req.body, 'peer');
    if (err) {
      req.flash('danger', err);
      return res.redirect('back');
    }

    const evaluator_number = req.user.employee_number;
    const be_evaluated_number = req.params.emp_id;
    const project_id = req.params.project_id;
    var performanceValue = (parseInt(req.body.utilization) + parseInt(req.body.pattern) + parseInt(req.body.platform) + parseInt(req.body.decomposition) + parseInt(req.body.system) + parseInt(req.body.component) + parseInt(req.body.readability) + parseInt(req.body.handling)) / 8.0;
    var communicationValue = (parseInt(req.body.easily) + parseInt(req.body.describe) + parseInt(req.body.explain) + parseInt(req.body.details) + parseInt(req.body.opinions)) / 5.0;

    conn.query('INSERT INTO peer_evaluations(project_id, evaluator_number, be_evaluated_number, performance_score, communication_score) VALUES (?,?,?,?,?)', [project_id, evaluator_number, be_evaluated_number, performanceValue, communicationValue],(err, rows) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');
      }
      req.flash('success', '평가를 완료하였습니다.');
      // redirect 어디로 해야할 지 봐야됨.
      res.redirect(`../../../../pm/${project_id}`);
    });

  })

router.route('/client/:id')
  .get(needAuth, (req, res, next) => {
    const project_id = req.params.id;
    conn.query('SELECT * FROM projects NATURAL JOIN (SELECT * FROM orders NATURAL JOIN clients) orders_clients WHERE project_id=?', [project_id], function(err, rows) {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const project = rows[0];
      res.render('evaluations/forms/client_evaluation_form', {project: project});
    })
  })
  .post(needAuth, (req, res, next) => {
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
      res.redirect('../client');
    })
  })

router.route('/pm/:project_id/:emp_id')
  .get(needAuth, (req, res, next) => {
    const project_id = req.params.project_id;
    const employee_number = req.params.emp_id;
    conn.query('SELECT project_id, project_name FROM projects WHERE project_id=?', [project_id], (err, rows) => {
      if (err) {
        req.flash('danger', err);
        return res.redirect('back');     
      }
      const project = rows[0];
      conn.query('SELECT employee_number, name, role FROM assignments NATURAL JOIN employees WHERE employee_number=? AND project_id=?', [employee_number, project_id], (err, rows2) => {
        if (err) {
          req.flash('danger', err);
          return res.redirect('back');
        }
        const employee = rows2[0];
        res.render('evaluations/forms/pm_evaluation_form', {project: project, employee: employee});
      })
    })
  })
  .post(needAuth, (req, res, next) => {
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
  });

module.exports = router;