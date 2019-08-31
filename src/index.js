//index.js: Provides a REST API to match headline data to employee data 

import 'dotenv/config';
import express from 'express';

const app = express();
const fs = require('fs');

const mongojs = require('mongojs');
var collections = ["employees", "headlines"];
var db = mongojs(process.env.MONGO_CONNECTION, collections);

//Process Employee Data
// 1) Remove any old employee data
// 2) Create new data from file
// IMPORTANT: We do the insert inside the remove callback to ensure
//            proper synchronization. See note below where the headline
//            data is processed 
fs.readFile(process.env.EMPLOYEE_FILE, 'utf8', function (err, data) {
	if (err) throw err;
	var json = JSON.parse(data);

	db.employees.remove({}, false, function(err, doc) {
		if(err) throw err;
		
		console.log('Startup: Removed '+doc.deletedCount+' documents from existing employee database.');
		db.employees.insert(json, function(err, doc) {
			if(err) throw err;
			console.log('Startup: Added '+doc.length+' documents from new employee file.');
		    });
	    });
    });

//Process Headline Data
// 1) Remove any old headline data
// 2) Create new data from file
// IMPORTANT: We do the insert inside the remove callback to ensure 
//            the remove completes first. As separate calls we could
//            have a race condition where the remove comes after the
//            insert. This actually happened in an early version, giving
//            the following console output:
//
//       Startup: Removed 100 documents from existing employee database.
//       Startup: Added 100 documents from new employee file.
//       Startup: Added 100 documents from new headlines file.
//       Startup: Removed 200 documents from existing headline database.
fs.readFile(process.env.HEADLINE_FILE, 'utf8', function (err, data) {
	if (err) throw err;
	var json = JSON.parse(data);

db.headlines.remove({}, false, function(err, doc) {
	if(err) throw err;

	console.log('Startup: Removed '+doc.deletedCount+' documents from existing headline database.');
	db.headlines.insert(json, function(err, doc) {
		if(err) throw err;
		console.log('Startup: Added '+doc.length+' documents from new headlines file.');
	    });
        });
    });

var itemsArr =[];
(function(items){app.get('/headlines/:dateParam', (req, res) => {
	    var pubDate = req.params.dateParam;
	    
	    //Validate parameter format as 'YYYY-MM-DD'
	    //Also does some simple sanity chacking:
	    // Year must begin with 1 or 2 (e.g. 1992 or 2010, but not 3525)
	    // Valid months are 01-12
	    // Valid days are 01-31
	    // Note this won't prevent e.g. February 31st, 1054 from getting
	    // through. Better date validation is a future exercise. 
	    var match = pubDate.match(/[1-2][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]/);
	    if (match === null) { //date is invalid
		return res.status(400).send('Date parameter \''+pubDate+'\' does not match YYYY-MM-DD format.');
	    }
	    db.headlines.find({"publication_date": req.params.dateParam}, {_id : 0}, function (err, docs) {
		if(err) throw err;

		//number of items in the document
		var length = Object.keys(docs).length;

		//Special handling for no data returned from initial find call
		//(i.e. caller passed a validly-formatted date but no 
		//documents matched.)
		//Lots of posts on proper response (404?, 200?, 204?)
		//I went with Jens Wurm's response in this post that begins "I 
		//strongly oppose 404 in favour of...":
		// https://stackoverflow.com/questions/11746894/what-is-the-proper-rest-response-code-for-a-valid-request-but-an-empty-data
		if (length == 0) { //no headlines match passed filter
		    return res.type('json').status(200).send('No headlines found with a publication date of '+pubDate+'.');
		}

		//If we get here we've got data so we process it
		for( var i = 0; i < length; i++) {
		    (function(index, hDocs, totalLength){db.employees.find({"location": docs[i].location_of_interest}, {_id : 0},  function (err, eDocs) {
				if (err) throw err;
				items.push({headlines: hDocs, employees: eDocs});
				
				//We're in the last iteration so send from here. Needed due to the asynchronous nature of Node
				if (index == totalLength-1) {
				    return res.type('json').status(200).send(items);
				}
			    });}(i, docs[i], length));
		}
		});
	});}(itemsArr));


//Stanzas for operations not yet implemented                                                                                    
app.put('/headlines/:myParam', (req, res) => {
        return res.status(405).end();
    });

app.post('/headlines/:myParam', (req, res) => {
	return res.status(405).end();
    });

app.patch('/headlines/:myParam', (req, res) => {
        return res.status(405).end();
    });

app.delete('/headlines/:myParam', (req, res) => {
        return res.status(405).end();
    });

app.listen(process.env.PORT, () =>
	   console.log(`Example app listening on port ${process.env.PORT}!`),
	   );import 'dotenv/config';
