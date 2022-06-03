const express = require('express');
const path = require('path');
const request = require('request');
const body_parser = require('body-parser');
const bcrypt = require('bcryptjs');
const users_module = require('./user');
const problem = require('./problem');
const challenges_module = require('./challenges');
const session = require('express-session');
const crypto = require('crypto');
const amqplib = require('amqplib/callback_api');
try{require("dotenv").config();}catch(e){console.log(e);}
const { exec } = require("child_process");
const { networkInterfaces } = require('os');
const cors = require('cors');

const app = express(); // create an instance of an express app
const nets = networkInterfaces();
const results = Object.create(null);

//middleware
app.use(cors());
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

function restrictAPI(req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    res.status(401).json({error: "Unauthorized"});
  }
};

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
  var email = req.body.email;
  var username = req.body.username;
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
    g_token: "",
    calendar_id: "",
    score: 0,
    challenges: []
  }).then( (user) => {
      req.session.regenerate(function(err) {
      req.session.user = user;
      req.session.success = 'Authenticated as' + user.username;
      res.redirect('/challenges');
    });
    //publisher
		amqplib.connect('amqp://guest:guest@rabbitmq', (err, connection) => {
    			if (err) {
        			console.error(err.stack);
        			//return process.exit(1);
    			}

    		// Create channel
    		connection.createChannel((err, channel) => {
        		if (err) {
            			console.error(err.stack);
            			//return process.exit(1);
        		}

			//create queue
			var queue = 'queue';
	
      			// Ensure queue for messages
      			channel.assertQueue(queue, {
            		// Ensure that the queue is not deleted when server restarts
            		durable: true
        		}, err => {
            		if (err) {
              			console.error(err.stack);
              			//return process.exit(1);
      				}

            		// Create a function to send objects to the queue
            		// Javascript object is converted to JSON and then into a Buffer
            		let sender = (content) => {
                		let sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(content)), {
                    		// Store queued elements on disk
                    		persistent: true,
                    		contentType: 'application/json'
                		});
            		};

            		// push message to queue
            		let sent = 0;
            		let sendNext = () => {
               	 	if (sent >= 1) {
                    			console.log('All messages sent!');
                    			// Close connection to AMQP server
                    			// We need to call channel.close first, otherwise pending
                    			// messages are not written to the queue
                    			return channel.close(() => connection.close());
                		}
                		sent++;
                		sender({
                    			to: email,
                    			subject: 'Test message #' + sent,
                    			text: 'email:' + email + ' username:' + username
                    		});
                    		return channel.close(() => connection.close());
            		};
            		sendNext();
        		});
    		});
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
      res.redirect('/challenges');
      });
    }
    else {
      req.session.error = 'Authentication failed, please check your ' + ' username and password.';
      res.redirect('/login');
	  }
  });
});

var host = "";
app.get('/login-google', (req, res) => {
  host = process.env.HOST_REDIRECT;
  if (!host)  host = 'http://localhost';
  //res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=https://www.codify.rocks/googlecallback&client_id="+process.env.G_CLIENT_ID);
  res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=" + host + "/googlecallback&client_id="+process.env.G_CLIENT_ID);
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
    redirect_uri: host + "/googlecallback",
    grant_type: 'authorization_code'
  }

  request.post({url: url, form: formData}, (error, response, body) => {
    if (error){
      console.log(error);
      alert(error);
    }
    var info = JSON.parse(body);
    if(info.error != undefined){
      res.send(info.error);
    }
    else{
      req.session.google_token = info.access_token;
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
    }
    // va salvato l'utente o va effettuato il login con le credenziali google, dove l'username può essere la email e la password il token
    users_module.User.exists({ username: utente.email }, (err, exists) => {
      if (err) {
	    res.json({success: false, message: err});
	    return;
	  }
      if (exists) {
        req.session.regenerate(function(err) {
        console.log(exists);
        req.session.user = {username: utente.email, email: utente.email, g_token: g_token, calendar_id: "", score: 0, challenges: []};
        req.session.success = 'Authenticates as' + utente.email;
        res.redirect("/challenges");
		});
	  }
      else {
        users_module.User.create({
	      username: utente.email,
	      email: utente.email,
	      password: g_token,
        g_token: g_token,
        calendar_id: "",
	      score: 0,
        challenges: []
	    }).then( (user) => {
	      req.session.regenerate(function(err) {
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


app.get('/logout', (req, res) => {
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

/****************************************************************************** */

// https://www.googleapis.com/calendar/v3/calendars/

app.get('/calendar', function(req, res){
  res.send("<br><br><button onclick='window.location.href=\"/create-calendar\"'>Add a new calendar</button>"+
          "<br><br><button onclick='window.location.href=\"/create-event\"'>Add event</button>"+
          "<br><br><button onclick='window.location.href=\"/delete-calendar\"'>Delete the calendar</button>");
});


app.get('/create-calendar', function(req, res){
  if (req.session.user.g_token == ""){
    res.redirect("/login-google");  // da cambiare con solo la richiesta per il token
  }
  if (req.session.user.calendar_id != ""){
    console.log("Calendar already exists");
    res.redirect("/profile");
  }
  var options = {
    url: 'https://www.googleapis.com/calendar/v3/calendars',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer '+req.session.user.g_token
    },
    body: JSON.stringify({'summary': 'Solving Challenge'})
  };
  request(options, function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      console.log("Info of the calendar");
      console.log(info);

      // add calendar to user
      users_module.User.findOneAndUpdate({ username: req.session.user.username}, {$set: {calendar_id: info.id}})
        .catch( (err) => {
          res.status(500).json({success: false, message: err});
        });
      console.log("Id:");
      console.log(info.id);
      var utente = req.session.user;
      req.session.regenerate(() => {
        req.session.user = {username: utente.email, email: utente.email, g_token: utente.g_token, calendar_id: info.id, score: utente.score, challenges: utente.challenges};
        res.redirect("/profile");
      });
    }
    else {
      res.json({error});
    }
  });
});

app.get('/delete-calendar', function(req, res){
  if (req.session.user.g_token == ""){
    res.redirect("/login-google");
  }
  if (req.session.user.calendar_id == ""){
    console.log("Calendar doesn't exist");
    console.log(req.session.user.calendar_id);
    console.log(req.session.user);
    res.redirect("/profile");
    return;
  }
  // req.session.calendar_id = "u0mhnsl1fb82mnkvmliie272jc@group.calendar.google.com";
  var options = {
    url: 'https://www.googleapis.com/calendar/v3/calendars/'+req.session.user.calendar_id,
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer '+req.session.user.g_token
    }
  };
  request(options, function callback(error, response, body) {
    if (error) {
      console.log({success: false, message: error});
    }
    console.log(body);
    // dovrebbe cancellare il calendario
    var utente = req.session.user;
    req.session.regenerate(() => {
      req.session.user = {username: utente.email, email: utente.email, g_token: utente.g_token, calendar_id: "", score: utente.score, challenges: utente.challenges};
      res.redirect("/profile");
    });
  });
});



app.get('/create-event', function(req, res) {
  if (req.session.user.g_token == ""){
    res.redirect("/login-google");
  }
  if (req.session.user.calendar_id == ""){
    console.log("Calendar doesn't exist");
    console.log(req.session.user);
    console.log(req.session.user.calendar_id);
    res.redirect("/profile");
    return;
  }
  var ts = Date.now();
  var date_ob = new Date(ts);
  var date = date_ob.getDate() + 1;
  var date2 = date+1;
  var month = date_ob.getMonth() + 1;
  var year = date_ob.getFullYear();
  
  // prints date & time in YYYY-MM-DD format
  console.log(year + "-" + month + "-" + date);
  var body = {
    "summary": "Prova google calendar 2",
    "description": "Questa è la prova del calendario",
    "start": {
      "date": year + "-" + month + "-" + date,
      "timeZone": "Europe/Zurich"
    },
    "end": {
      "date": year + "-" + month + "-" + date2,
      "timeZone": "Europe/Zurich"
    }
  };
  request({
    url: 'https://www.googleapis.com/calendar/v3/calendars/'+req.session.user.calendar_id+'/events',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer '+req.session.user.g_token
    },
    body: JSON.stringify(body)
  }, function callback(error, response, body1) {
    if (!error) {
      var info = JSON.parse(body1);
      console.log("Informazioni del nuovo evento creato");
      console.log(info);
      res.redirect("/profile");
    }
    else {
      console.log(error);
    }
  });
});


/************************************************************************************ */
app.get('/challenges', restrict, (req, res) => {
  res.sendFile(path.join(__dirname, '/static/templates/problems/problems.html'))
});

app.get('/challenge', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/templates/problem/problem.html'))
});


app.get("/profile", restrict, (req, res) => {
  res.sendFile(path.join(__dirname, '/static/templates/profilo/profilo.html'));
});


app.get("/addChallenge", restrict, (req, res) => {
  users_module.User.findOneAndUpdate({ username: req.session.user.username}, {$push: {challenges: req.query.id}, $inc: {score: parseInt(req.query.score)}})
	.catch( (err) => {
	  res.status(500).json({success: false, message: err});
	});
});



app.get("/getUsers", (req, res) => {
  users_module.User.find({})
    .then( (users) => {
      res.status(200).send({success: true, users: users});
	}) 
    .catch( (err) => {
      res.status(500).json({success: false, message: "Internal server error"});
	});
});

app.get("/getChallenges", (req, res) => {
  challenges_module.Challenge.find({})
    .then( (challenges) => {
      res.status(200).send({success: true, challenges: challenges});
	}) //
    .catch( (err) => {
      res.status(500).json({success: false, message: "Internal server error"});
	});
});


app.get("/userInfo", restrict, (req, res) => {
  users_module.User.findOne({ username: req.session.user.username })
    .then( (user) => {
      if (!user) {
        res.status(404).send({success: false, error: 'User not found.' + user});
      }
      else {
			res.status(200).send({success: true, id: user.id, username: user.username, email: user.email, g_token: user.g_token, calendar_id: user.calendar_id, score: user.score, challenges: user.challenges});
      }
	})
	.catch( (err) => {
	  res.status(500).json({success: false, message: "Internal server error"});
	});
});

app.get("/getChallenge", (req, res) => {
  var id = req.query.id;
  challenges_module.Challenge.findOne({'title': 'Challenge '+id.toString()})
    .then( (challenge) => {
      res.status(200).send(challenge);
	}) //
    .catch( (err) => {
      res.status(500).json({success: false, message: "Internal server error"});
	});
});

app.get("/isLoggedIn", (req, res) => {
    if (req.session.user) {
	  res.status(200).send({success: true, user: req.session.user});
	}
	else {
	  res.status(200).send({success: false, user: null});
	}
});

app.post('/getOutput', (req, res) => {
  problem.getResult(req.body.code, req.body.language, req.body.version).then((output) => {
    res.send(output);
  });
})

// #############################################################################
// SECTION FOR REST API
// #############################################################################


/**
 * @api {get} /api/users/username Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} username Users username.
 *
 *
 * @apiSuccess {String} username Username of the User.
 * @apiSuccess {String} email Email of the User.
 * @apiSuccess {String} score Score of the User.
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *         "username": "test",
 *         "email": "test@test.com",
 *         "score": 0
 *    }
 *
 *
 * @apiError error User not found.
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 404 Not found
 *    {
 *        "error": "User not found"
 *    }
 *
 * */

app.get("/api/users/:user", (req, res) => {
  users_module.User.findOne({ username: req.params.user })
    .then( (user) => {
      if (!user) {
        res.status(404).send({success: false, error: 'User not found.'});
      }
      else {
			res.status(200).send({success: true, username: user.username, email: user.email, score: user.score});
      }
	})
	.catch( (err) => {
	  res.status(500).json({success: false, message: "Internal server error"});
	});
});


/**
 * @api {post} /api/users/create Create a new User 
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiSuccess {String} Message Message of success.
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "message": "User created"
 *    }
 *
 *
 * @apiError Message User already exists.
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 409 Not found
 *    {
 *        "error": "User already exists"
 *    }
 *
 * */

app.post("/api/users/create", (req, res) => {
  users_module.User.findOne({ username: req.body.username })
    .then( (user) => {
      if (user) { res.status(409).send({success: false, error: 'User already exists.'}); }
      else { 
	users_module.User.create({
	  username: req.body.username,
	  email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
	  score: 0
	}).then( (user) => {
	  res.status(200).send({success: true, message: 'User created.'});
	}).catch( (err) => {
	  res.status(500).json({success: false, message: "Internal server error"});
	});
      }
	})
});


/**
 * @api {post} /api/users/delete Delete User
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiSuccess {String} Message Message of success.
 *
 * @apiSuccessExample Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *        "message": "User deleted"
 *    }
 *
 *
 * @apiError Message User not found.
 * @apiErrorExample Error-Response:
 *    HTTP/1.1 404 Not found
 *    {
 *        "error": "User not found"
 *    }
 *
 * @apiError Message Wrong password.
 * @apiErrorExample Error-Response:
 *   HTTP/1.1 401 Wrong password
 *   {
 *      "error": "Wrong password"
 *   }
 * */

app.delete("/api/users/delete", (req, res) => {
  users_module.User.findOne({ username: req.body.username })
    .then( (user) => {
      if (!user) { res.status(404).send({success: false, error: 'User not found.'}); }
      else { 
		if (!bcrypt.compareSync(req.body.password, user.password)) {
		  res.status(401).send({success: false, error: 'Wrong password.'});
		}
		else {
      	  users_module.User.remove({ username: req.body.username })
      	    .then( (user) => {
      	      res.status(200).send({success: true, message: 'User deleted.'});
		    }).catch( (err) => {
      	      res.status(500).json({success: false, message: "Internal server error"});
		    });
		}
	  }
	}).catch( (err) => {
      res.status(500).json({success: false, message: "Internal server error"});
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
