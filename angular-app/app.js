"use strict";
var express = require('express'),
	mongojs = require('mongojs'),

	app = express(),
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler'),
	methodOverride = require('method-override'),
	port = 8000;

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.listen(port);
console.log('listening on port: ' + port);