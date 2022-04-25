const express = require('express');
// const jwt = require('jsonwebtoken');
const path = require('path');
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const users_module = require('./user');
// const jwtutils = require('./jwtutils');
const session = require('express-session');
const { join } = require('path');

const app = express(); // create an instance of an express app

//middleware
app.use(body_parser.json()); // support json encoded bodies
app.use(body_parser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: '1050db049ff7fdfba85e583303da60b8', 
  //24 hours
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

//static files
app.use(express.static(path.join(__dirname, '/static')));

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

function authenticate(name, pass, fn) {
  users_module.User.findOne({ username: name })
    .then( (user) => { 
      if (!user) {
	    return fn(null,null);
      }
      else {
        if (!bcrypt.compareSync(pass, user.password)) {
		  return fn(null,null);
		} 
		else {
		  return fn(null,user);
		}
      }
  });
}
 
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

users_module.mongoconnect();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// <<<<<<< HEAD
// <<<<<<< HEAD
// =======
// =======
// >>>>>>> 9fd020612f1b0b69baf175af28134eb81281f273

// >>>>>>> 9fd020612f1b0b69baf175af28134eb81281f273
//signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/templates/signup/signup.html'));
});

// signup post request
app.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.json({success: false, message: 'Please enter username, email and password.'});
    res.redirect('/signup');
    return;
  }
  users_module.User.exists({ username: req.body.username }, (err, exists) => {
    if (err) {
      res.json({success: false, message: err});
      res.redirect('/signup');
      return;
    }
    if (exists) {
      res.json({success: false, message: 'Username already exists.'});
      res.redirect('/signup');
      return;
    }
  users_module.User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }).then( (user) => {
	  req.session.regenerate(function(err) {
	    req.session.user = user;
		req.session.success = 'Authenticates as' + user.username;
        res.redirect('/');
    });
  });
});
});

//login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname,'/static/templates/login/login.html'));
});

// login post request
app.post('/login', (req, res, next) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.json({success: false, message: 'Please enter username, email and password.'});
    return;
  }
  
  /*users_module.User.findOne({ username: req.body.username })
    .then( (user) => { 
      if (!user) { res.json ({success: false, message: 'User not found.'}); }
      else {
        if (!bcrypt.compareSync(req.body.password, user.password)) {
		  res.json({success: false, message: 'Wrong password.'});
		} else {
          const token = jwt.sign({id: user._id, username: user.username}, jwtutils.JWT_SECRET, {expiresIn: 60*60});
		  //res.json({success: true, message: 'User logged in!', token: token});
		  res.header('Set-Cookie', `x-access-token=${token};`);
		}
	  }
  })
  .catch( (err) => {
    res.json({success: false, message: err.message});
  });
  */
  authenticate(req.body.username, req.body.password, (err, user) => {
    if (err) {
      return next(err);
	}
    if (user) {
	  req.session.regenerate(function(err) {
	    req.session.user = user;
		req.session.success = 'Authenticates as' + user.username;
        res.redirect('/');
	  });
	}
    else {
      req.session.error = 'Authentication failed, please check your '
      + ' username and password.';
      res.redirect('/login');
	}
  });
});

app.get('/logout', function(req, res){
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/restricted', restrict, function(req, res){
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/challenges', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/templates/problem/problem.html'))
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
