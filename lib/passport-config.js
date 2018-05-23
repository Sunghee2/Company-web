const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const conn = mysql.createConnection(require('../config/dbconfig.js'));
conn.connect()

module.exports = function(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.ID);
  });

  passport.deserializeUser((id, done) =>  {
    conn.query('SELECT e.employee_number, ID, password, m.employee_number manager FROM accounts e LEFT JOIN manager m ON e.employee_number=m.employee_number WHERE id=?', [id], (err, rows) => {
      const user = rows[0];
      done(null, user);
    })
  });

  passport.use('local-signin', new LocalStrategy({
    usernameField : 'id',
    passwordField : 'password',
    passReqToCallback : true
  }, async (req, id, password, done) => {
    try {
      conn.query('SELECT e.employee_number, ID, password, m.employee_number manager FROM accounts e LEFT JOIN manager m ON e.employee_number=m.employee_number WHERE id=?', [id], function(err, rows) {
        var user = rows[0];
        if (err) {
          return done(null, false, req.flash('danger', err));
        } else {
          if (!user) {
            return done(null, false, req.flash('danger', 'Invalid ID!'));
          } else {
            if(!bcrypt.compareSync(password, user.password)) {
              return done(null, false, req.flash('danger', 'Invalid password!'));
            } else {
              return done(null, user, req.flash('success', 'Welcome!'));
            }
          }
        }
      })
    } catch(err) {
      done(err);
    }
  }));
};