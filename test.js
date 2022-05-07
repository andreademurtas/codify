var should = require('chai').should();
var assert = require('chai').assert
var https = require('https');
const axios = require('axios');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

describe("Test if the website is up and running (HTTP)", function() {
    it("should return 200", function(done) {
       axios.get('http://codify.rocks').then(function(response) {
           response.status.should.equal(200);
		   done();
	   }).catch(function(error) { 
		   done(error);
	   });
	});
});

describe("Test if the website is up and running (HTTPS)", function() {
    it("should return 200", function(done) {
        axios.get('https://codify.rocks', {httpsAgent: agent}).then(function(response) {
	       response.status.should.equal(200);
		   done();
	}).catch(function(error) {
		   done(error);
	});
  });
});


describe("Test if REST API for creating a new user is working", function() {
    it("should return 200", function(done) {
        axios.post('https://codify.rocks/api/users/create', {
            "username": "test",
            "email": "test@test.com",
            "password": "test"
		}, {httpsAgent: agent}).then(function(response) {
			response.status.should.equal(200);
			done();
		}).catch(function(error) {
			done(error);
		});
	})
});

describe("Test if REST API for getting user information is working", function() {
    it("should return 200", function(done) {
        axios.get('https://codify.rocks/api/users/test', {httpsAgent: agent}).then(function(response) {
			response.status.should.equal(200);
		    response.data.username.should.equal("test");
			response.data.email.should.equal("test@test.com");
		    done()
		}).catch(function(error) {
			done(error);
		});
	});
});

describe("Test if REST API for deleting a user is working", function() {
    it("should return 200", function(done) {
        axios.delete("https://codify.rocks/api/users/delete",{
		    httpsAgent: agent,
			data: {
              "username": "test",
		      "password": "test"
		    }
		}).then(function(response) {
			response.status.should.equal(200);
			done();
		}).catch(function(error) {
			done(error);
		});
	});
});
