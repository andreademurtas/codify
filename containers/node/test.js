var should = require('chai').should()
const axios = require('axios')

describe("Test if the website is up and running", function() {
    it("should return 200", function() {
       axios.get('http://localhost:3000/').then(function(response) {
           response.status.should.equal(200);
	   }).catch(function(error) { 
		   var one = 1;
		   one.should.equal(2);
	   });
	});
});
