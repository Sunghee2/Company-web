const express = require('express');
const catchErrors = require('../lib/async-error');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/new', catchErrors(async (req, res, next) => {
  // var err = validateForm(req.body, {needPassword: true});
  // if (err) {
  //   req.flash('danger', err);
  //   return res.redirect('back');
  // }
  // var user = await User.findOne({email: req.body.email});
  // console.log('USER???', user);
  // if (user) {
  //   req.flash('danger', 'Email address already exists.');
  //   return res.redirect('back');
  // }
  // user = new User({
  //   name: req.body.name,
  //   email: req.body.email,
  // });
  // user.password = await user.generateHash(req.body.password);
  // await user.save();
  var account = {
              'id': req.body.id,
              'password': req.body.password,
              'employee_number': req.body.employee_number
            }

  // var employee = {
  //             'employee_number': req.body.employee_number,
  //             'g': req.body.,
  //             '': req.body.email,
  //             '': req.body.}
  req.flash('success', 'Registered successfully. Please sign in.');
  res.redirect('/');
}));

module.exports = router;
