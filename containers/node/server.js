const express = require('express');
const path = require('path');
const request = require('request');
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const users_module = require('./user');
const session = require('express-session');
const crypto = require('crypto');
try{require("dotenv").config();}catch(e){console.log(e);}
const { exec } = require("child_process");

const app = express(); // create an instance of an express app
const nets = networkInterfaces();
const results = Object.create(null);

//middleware
app.use(body_parser.json()); // support json encoded bodies
app.use(body_parser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: crypto.randomBytes(32).toString("hex"), 
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

// APIDOC
app.use('/api-docs', express.static(path.join(__dirname, '/docs')));

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
  res.sendFile(path.join(__dirname + '/static/templates/homepage/homepage.html'));
});

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
      return;
    }
    if (exists) {
      res.json({success: false, message: 'Username already exists.'});
      return;
    }
  users_module.User.exists({ email: req.body.email }, (err, exists) => {
    if (err) {
      res.json({success: false, message: err});
      return;
    }
    if (exists) {
      res.json({success: false, message: 'Email already exists.'});
      return;
    }
  users_module.User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    score: 0
  }).then( (user) => {
	  req.session.regenerate(function(err) {
	    req.session.user = user;
		req.session.success = 'Authenticates as' + user.username;
        res.redirect('/');
      });
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
  if (!req.body.username || !req.body.password) {
    res.json({success: false, message: 'Please enter username and password.'});
    return;
  }
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


app.get('/login-google', (req, res) => {
  var host = "";
  exec("whoami", (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    if (console.log(stdout).includes("ubuntu")) {
      host = "www.rockify.rocks";
	}
	else {
	  host = "localhost";
	}
  });
  //res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=https://www.codify.rocks/googlecallback&client_id="+process.env.G_CLIENT_ID);
  res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http://" + host + "/googlecallback&client_id="+process.env.G_CLIENT_ID);
}); 
app.get('/googlecallback', (req, res) => {
  if (req.query.code!=undefined){  
    res.redirect('gtoken?code='+req.query.code)
  }
  else{
    res.send('Errore durante la richiesta del code di Google');
  }
});

app.get('/gtoken', (req, res) => {
  var url = 'https://www.googleapis.com/oauth2/v3/token';
  var formData = {
    code: req.query.code,
    client_id: process.env.G_CLIENT_ID,
    client_secret: process.env.G_CLIENT_SECRET,
    //redirect_uri: "https://www.codify.rocks/googlecallback",
    redirect_uri: "http://" + host + "/googlecallback",
    grant_type: 'authorization_code'
  }

  request.post({url: url, form: formData}, (error, response, body) => {
    if (error){
      console.log(error);
      alert(error);
    }
    var info = JSON.parse(body);
    console.log("Info:");
    console.log(info);
    if(info.error != undefined){
      res.send(info.error);
    }
    else{
      req.session.google_token = info.access_token;
      console.log("Il token di google è: "+req.session.google_token);
      res.redirect('/registration-google');
    }
  });
});

app.get('/registration-google', (req, res) => {
  if(req.session.google_token == undefined){
    res.send('Error');
  }
  var g_token = req.session.google_token;
  var data_url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+g_token;
  // var headers = {'Authorization': 'Bearer '+g_token};
  var utente;
  request.get({url: data_url}, (err, resp, body) => {
    if (err){
      console.log(err);
    }
    var data = JSON.parse(body);
    console.log(data);
    if(data.error != undefined){
      res.send(data.error);
    }
    else{
      utente = {
        "id":	data.id,
        "email":	data.email,
        "verified_email":	data.verified_email,
        "name":	data.name,
        "given_name":	data.given_name,
        "family_name":	data.family_name,
        "picture":	data.picture,
        "locale":	data.locale,
      }
      console.log(utente)
    }
    // va salvato l'utente o va effettuato il login con le credenziali google, dove l'username può essere la email e la password il token
    users_module.User.exists({ username: utente.email }, (err, exists) => {
      if (err) {
	    res.json({success: false, message: err});
	    return;
	  }
      if (exists) {
        req.session.regenerate(function(err) {
		  console.log("Got here: req.session.regenerate after exists");
          req.session.user = utente.email;
		  req.session.success = 'Authenticates as' + utente.email;
          res.redirect("/challenges");
		});
	  }
      else {
        users_module.User.create({
	      username: utente.email,
	      email: utente.email,
	      password: g_token,
	      score: 0
	    }).then( (user) => {
	      req.session.regenerate(function(err) {
		      console.log("Got here: req.session.regenerate after creating user");
	          req.session.user = user;
			  req.session.success = 'Authenticates as' + user.username;
	          res.redirect("/challenges");
	      });
        }).catch( (err) => { 
		    console.log(err);
	        return;
	      });
	    }
	  });
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

app.get('/user', restrict, function(req,res){
  res.send("<h1>hello</h1>");
});

// #############################################################################
// SECTION FOR REST API
// #############################################################################


/**
 * @api {get} /api/users/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users username.
 *
 *
 * @apiSuccess {String} username Username of the User.
 * @apiSuccess {String} email Email of the User.
 * @apiSuccess {String} score Score of the User.
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "username": "test",
 *         "email": "test@test.com",
 *         "score": 0
 *    }
 *
 *
 * @apiError UserNotFound The User was not found.
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 404 Not found
 *    {
 *        "error": "UserNotFound"
 *    }
 * */

app.get("/api/user/:user", (req, res) => {
  users_module.User.findOne({ username: req.params.user })
    .then( (user) => {
      if (!user) {
        res.status(404).send({success: false, message: 'User not found.'});
      }
      else {
			res.status(200).send({success: true, username: user.username, email: user.email, score: user.score});
      }
	})
	.catch( (err) => {
	  res.json({success: false, message: err});
	});
});

// #############################################################################
// END OF REST API 
// #############################################################################

app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, '/static/docs/docs.html'));
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
