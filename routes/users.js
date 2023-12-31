const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Book = require('../models/Book');

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
const regex = /@mnnit\.ac\.in$/;

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));


// Register
router.post('/register', (req, res) => {

  const { name, email, password, password2, number } = req.body;
  let errors = [];
  
  if (!name || !email || !password || !password2 || !number) {
    errors.push({ msg: 'Please enter all fields' });
  }
  if (!regex.test(email)) {
    errors.push({ msg: 'Please register with MNNIT email address' });
  } 

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  //
  if (number.length != 10) {
    errors.push({ msg: 'Type valid Mobile number' });
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      number,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          number,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          number,
          password
        });

        bcrypt.hash(req.body.password, 10).then(hashedPassword => {
          newUser.password = hashedPassword;
          newUser.save().then(item => {
            // console.log(item)
            res.redirect('/login');
          }).catch(err => {
            console.log(err);
          })
        }).catch(err => {
          console.log(err);
        })
      }
    });
  }

});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});



// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

//delete account
router.get('/remove', (req, res) => {
  req.flash('success_msg', 'You successfully deleted your account');
  res.redirect('/');
});

module.exports = router;
