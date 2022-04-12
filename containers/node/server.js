const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const users_module = require('./user');
const jwtutils = require('./jwtutils');

const app = express(); // create an instance of an express app
app.use(body_parser.json()); // support json encoded bodies

//static files
app.use(express.static(path.join(__dirname, '/static')));

users_module.mongoconnect();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/login/login.html'));
});

//signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname + '/static/templates/signup/signup.html'));
});

// signup post request
app.post('/signup', (req, res) => {
  if (!req.body.username || !req.body.email || !req.body.password) {
    res.json({success: false, message: 'Please enter username, email and password.'});
    return;
  }
  users_module.User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  }).then( (user) => {
    const token = jwt.sign({id: user._id, username: user.username}, jwtutils.JWT_SECRET, {expiresIn: 60*60});
    res.json({success: true, message: 'User created!', token: token});
  }).catch( (err) => {
    res.json({success: false, message: err.message});
  });
});

//login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname,'/static/templates/login.html'));
});

// login post request
app.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    res.json({success: false, message: 'Please enter username, email and password.'});
    return;
  }
  
  users_module.User.findOne({ username: req.body.username })
    .then( (user) => { 
      if (!user) { res.json ({success: false, message: 'User not found.'}); }
      else {
        if (!bcrypt.compareSync(req.body.password, user.password)) {
		  res.json({success: false, message: 'Wrong password.'});
		} else {
          const token = jwt.sign({id: user._id, username: user.username}, jwtutils.JWT_SECRET, {expiresIn: 60*60});
		  res.json({success: true, message: 'User logged in!', token: token});
		}
	  }
  })
  .catch( (err) => {
    res.json({success: false, message: err.message});
  });
});

app.post('/test', jwtutils.verifyToken, (req, res) => {
  res.json({success: true, message: 'You are authenticated!'});
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
