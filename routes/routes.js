var passport = require('passport');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var config = require('../config/database');

module.exports = function(app, passport) {
  app.get('/', function(req, res) {
    res.json('Welcome to my Node.js Auth App');
  });

  app.post('/signup', function(req, res) {
    var newUser = new User({
      email: req.body.email,
      password: req.body.password
    });

    User.createUser(newUser, function(err, user) {
      if(err) {
        res.json({ success: false, message: 'Email is taken.' })
      } else {
        res.json({ success: true, message: 'New account was successfully created.' })
      }
    });
  });

  app.post('/login', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    User.getUserByEmail(email, function(err, user) {
      if(err) throw err;
      if(!user) {
        return res.json({ success: false, message: 'User not found.' });
      }
      User.comparePassword(password, user.password, function(err, isMatch) {
        if(err) throw err;
        if(isMatch) {
          var token = jwt.sign(user.toJSON(), config.secret, { expiresIn: 604800 }); // 604800 === 1 week
          res.json({
            success: true,
            token: 'JWT ' + token,
            user: {
              id: user._id,
              email: user.email,
              password: user.password
            }
          });
        } else {
          return res.json({ success: false, message: 'Password does not match.' });
        }
      });
    });
  });

  app.get('/profile', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    res.json({ user: user.req });
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};
