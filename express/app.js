"use strict";
var express = require('express'),
	mongojs = require('mongojs'),
	fs = require('fs'),
	
	bodyParser = require('body-parser'),
	errorHandler = require('errorhandler'),
	methodOverride = require('method-override'),

	app = express(),
	db = mongojs('localhost:3001/meteor', ['lists', 'messages']),

	port = 8000,
	angularHtml = './angular/index.html';
	// indexFile = fs.readFileSync('./public/index.html');

app.use(methodOverride());
app.use(bodyParser());
app.use(express.static('./angular'));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.get('*', function(req,res) {
	res.set('Content-Type', 'text/html');
	fs.createReadStream(angularHtml).pipe(res);
	// res.send(indexFile);
});

app.post('/api/v1/list/:list/item/:item/vote', function(req,res) {
	console.log('updating the list item', req.params);
	db.lists.update({ _id: req.params.list, 'items._id': req.params.item }, { $inc: { 'items.$.votes':1 } }, function(err,result) {
		if(err) {
			return res.json(err);
		}

		res.json({ data: result });
	});
});

app.post('/api/v1/list/:list/item/:item/comment', function(req,res) {
	console.log('updating the list item', req.params);
	console.log('comment', req.body.comment);
	
	if(!req.body.comment) {
		res.json({ msg: 'No comment posted' });
		return;
	}

	var comment = {
		text: req.body.comment,
		user: req.body.user
	};

	db.lists.update({ _id: req.params.list, 'items._id': req.params.item }, { $addToSet: { 'items.$.comments': comment } }, function(err,result) {
		if(err) {
			return res.json(err);
		}

		res.json({ data: result });
	});
});


app.post('/api/v1/list/:list/item/:item/complete', function(req,res) {
	console.log('updating the list item', req.params);
	console.log('item', req.body.item);
	
	if(!req.body.item) {
		res.json({ msg: 'No item posted' });
		return;
	}

	db.lists.update({ _id: req.params.list, 'items._id': req.params.item }, { $set: { 'items.$.complete': req.body.item.complete } }, function(err,result) {
		if(err) {
			return res.json(err);
		}

		res.json({ data: result });
	});
});


app.listen(port);
console.log('express listening on port: ' + port);
