//test.js. Testcases for the Headlines project

const request = require('request');
const assert = require('assert');


//Happy Path case. We pass a proper URL and date parameter
describe('Get', function() {
	describe('Get that returns data', function() {
		it('should return headlines and employees with the date of 2015-09-17',
		   function() {
		       request(
			       { method: 'GET', uri: 'http://localhost:3000/headlines/2015-09-17'}
			       , function (error, response, body) {
				   var jsonObj = JSON.parse(body);
				   for (var i = 0; jsonObj[i] != undefined; i++) {
				       assert.equal(jsonObj[i].headlines.publication_date,'2015-09-17');
				   }
			       });
		   });
	    });
    });

//Proper URL but no matching data
describe('Get', function() {
	describe('Get with valid date but no match', function() {
		it('should return a valid status but no data', 
		   function() {	
		       request(
			       { method: 'GET', uri: 'http://localhost:3000/headlines/1973-05-25' },
			       function (error, response, body) {
				   assert.equal(response.statusCode, 200);
				   assert.equal(body, 'No headlines found with a publication date of 1973-05-25.');
			       });
		   });
	    });
    });


//Improperly formed parameter
describe('Get with bad parameter', function() {
	it('should return status 400 and an appropriate message', function() {
		request(
			{ method: 'GET', uri: 'http://localhost:3000/headlines/apple'},
			function (error, response, body) {
			    assert.equal(response.statusCode, 400);
			    assert.equal(body, 'Date parameter \'apple\' does not match YYYY-MM-DD format.');
			});
	    });
    });

//Non-implemented Actions                                                                                                         
describe('Put call', function() {
        it('should return status 405', function() {
                request(
                        { method: 'PUT', uri: 'http://localhost:3000/headlines/2016-02-05'},
                        function (error, response, body) {
                            assert.equal(response.statusCode, 405);
                        });
            });
    });

describe('Post call', function() {
        it('should return status 405', function() {
                request(
                        { method: 'POST', uri: 'http://localhost:3000/headlines/2016-02-05'},
                        function (error, response, body) {
                            assert.equal(response.statusCode, 405);
                        });
            });
    });

describe('Patch call', function() {
        it('should return status 405', function() {
                request(
                        { method: 'PATCH', uri: 'http://localhost:3000/headlines/2016-02-05'},
                        function (error, response, body) {
                            assert.equal(response.statusCode, 405);
                        });
            });
    });

describe('Delete call', function() {
        it('should return status 405', function() {
                request(
                        { method: 'DELETE', uri: 'http://localhost:3000/headlines/2016-02-05'},
                        function (error, response, body) {
                            assert.equal(response.statusCode, 405);
                        });
            });
    });
