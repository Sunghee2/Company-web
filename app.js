var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var passportConfig = require('./lib/passport-config');

var app = express();

var conn = mysql.createConnection(require('./config/dbconfig.js'));

conn.connect((err)=> {
  if(err) {
    console.log(err);
    return;
  }
  console.log('mysql connect completed');
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, 
  sourceMap: true
}));

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'long-long-long-secret-string-1313513tefgwdsvbjkvasd'
}));

app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

app.use(function(req, res, next) {
  // res.locals.currentUser = req.user;  // passport는 req.user로 user정보 전달
  res.locals.flashMessages = req.flash();
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
require('./routes/auth')(app, passport);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
