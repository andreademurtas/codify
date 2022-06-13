const request = require('request');
const users_module = require('./user');
var axios = require('axios');
try{require("dotenv").config();}catch(e){console.log(e);}



function user_has_calendar(user){
  return new Promise((resolve, reject) => {
    users_module.User.findOne({ username: user.username }).then( (utente) => {
      //console.log("utente");
      //console.log(utente);
      if (utente.calendar_id == "" ){
        resolve({success: true, message: ""});
      }
      else {
        resolve({success: true, message: utente.calendar_id});
      }
    })
    .catch( (err) => {
      //console.log("Errore has calendar id");
      //console.log(err);
      resolve({success: false, message: err});
    });
  });
}

async function create_calendar(user){
  return new Promise((resolve, reject) => {
    var options = {
      url: 'https://www.googleapis.com/calendar/v3/calendars',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer '+user.g_token
      },
      body: JSON.stringify({'summary': 'Solving Challenge'})
    };

    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);    
        // add calendar to user
        users_module.User.findOneAndUpdate({ username: user.username}, {$set: {calendar_id: info.id}})
          .catch( (err) => {
            resolve({success: false, message: err});
          });
        //console.log("Id:");
        //console.log(info.id);
        resolve({success: true, message: info.id});
      }
      else{
        //console.log("errore create calendar interno");
        //console.log(error);
        resolve({success: false, message: "Errore create calendar"});
      }
    });
    // resolve(response);
  });
}

async function check_calendar(user_) {
  return new Promise((resolve, reject) => {
    //console.log("Create event");
    user_has_calendar(user_).then((calendar_id) => {
      //console.log("Calendar id");
      //console.log(calendar_id);
      
      if (!calendar_id.success) {
          resolve({ success: false, message: calendar_id });
      }
      if (calendar_id.message == '') {
        //console.log("Creo calendario");
        create_calendar(user_).then((calendar_id_) => {
          if (!calendar_id_.success){
            resolve({success: false, message: "Error check calendar - calendar create"});
          }
          //console.log(calendar_id_);
          //console.log("Calendario creato");
          resolve({success: true, message: calendar_id_.message});
        }).catch((error) => {
          //console.log("errore create calendar");
          //console.log(error);
          resolve({success: false, message: "Errore create calendar"});
        });
      }
      else{
        resolve({success: true, message: calendar_id.message});
      }
    });
  });
}

async function create_event(user_){
  return new Promise((resolve, reject) => {
    if (user_.g_token == ""){
      // //console.log("g_token doesn't exist");
      resolve({success: false, message: "You have to log in with google"});
    }
    check_calendar(user_).then((calendar_id) => {
      if (!calendar_id.success){
        // //console.log("Errore check calendar");
        resolve({success: false, message: "Errore"});
      }
      calendar_id = calendar_id.message;
      var ts = Date.now();
      var date_ob = new Date(ts);
      var date = date_ob.getDate() + 1;
      var date2 = date + 1;
      var month = date_ob.getMonth() + 1;
      var year = date_ob.getFullYear();

      // prints date & time in YYYY-MM-DD format
      // //console.log(year + "-" + month + "-" + date);
      var body = {
          "summary": "Promemoria coding challenge",
          "description": "Allenati!!!",
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
          url: 'https://www.googleapis.com/calendar/v3/calendars/' + calendar_id + '/events',
          method: 'POST',
          headers: {
              'content-type': 'application/json',
              'Authorization': 'Bearer ' + user_.g_token
          },
          body: JSON.stringify(body)
      }, (error, response, body) => {
          // //console.log(error);
          // //console.log(body);
          if (!error) {
              var info = JSON.parse(body);
              // //console.log(info);
              resolve({ success: true, message: "Evento creato" });
          }
          else {
              // //console.log(error);
              // //console.log(body);
              resolve({ success: false, message: error });
          }
      });
    });
  });
}

function delete_calendar(user){
  return new Promise((resolve, reject) => {
    user_has_calendar(user).then((calendar_id) => {
      if (!calendar_id.success){
        resolve({success: false, message: "Problema generico"});
      }
      if (user.g_token == ""){
        // //console.log("g_token doesn't exist");
        resolve({success: false, message: "You have to log in with google"});
      }
      if (calendar_id.message == ""){
        // //console.log("Calendar doesn't exist");
        resolve({success: false, message: "Calendar doesn't exist"});
      }
      var options = {
        url: 'https://www.googleapis.com/calendar/v3/calendars/'+calendar_id.message,
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer '+user.g_token
        }
      };
      request(options, function callback(error, response, body) {
        if (error) {
          resolve({success: false, message: error});
        }
        // //console.log(body);
        // dovrebbe cancellare il calendario
        users_module.User.findOneAndUpdate({ username: user.username}, {$set: {calendar_id: ""}})
        .catch( (err) => {
          resolve({success: false, message: err});
        });
        resolve({success: true, message: "Calendario eliminato"});
      });
    });
  });
}

function link_calendar(user){
	return new Promise((resolve, reject) => {
		if (user.g_token != ""){
			resolve({success: false, message: "You already have a google account linked"});
		}
	});
}




exports.create_calendar = create_calendar;
exports.create_event = create_event;
exports.delete_calendar = delete_calendar;



