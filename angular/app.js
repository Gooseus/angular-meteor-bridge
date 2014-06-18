"use strict";
var express = require('express'),
	mongojs = require('mongojs'),
	fs = require('fs'),

	app = express(),
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler'),
	methodOverride = require('method-override'),
	port = 8000,
	indexHtml = './public/index.html';
	// indexFile = fs.readFileSync('./public/index.html');

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.get('*', function(req,res) {
	res.set('Content-Type', 'text/html');
	fs.createReadStream(indexHtml).pipe(res);
	// res.send(indexFile);
});

app.listen(port);
console.log('listening on port: ' + port);