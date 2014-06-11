Messages = new Meteor.Collection("messages");

Collections = {
	Messages: Messages
};

if (Meteor.isClient) {
	var $client = window.top,
		$api = {
			insert: function(coll,doc) {
				console.log('inserting doc: ', doc, coll);
				doc.created_at = new Date();
				Collections[coll].insert(doc);
			}
		};

	window.onmessage = function(e) {
		console.log('message from client',e);
		var msg = e.data;
		if(msg.fn) {
			$api[msg.fn].apply(null,msg.args);
		}
		// $client.postMessage({ fn: 'res', msg: 'ECHO: ' + e.data.msg }, '*');
	};

	Meteor.subscribe('messages');

	// Listen to new additions to our client side collections
	Object.keys(Collections).forEach(function(coll) {
		Collections[coll].find().observe({
			added: function(doc) {
				$client.postMessage({ coll: coll, op: 'added', doc: doc  }, '*');
			},
			removed: function(doc) {
				$client.postMessage({ coll: coll, op: 'removed', doc: doc  }, '*');	
			}
		});
	});

	// Messages.find().observe({
	// 	added: function(newDoc) {
	// 		$client.postMessage({ coll: 'Messages', op: 'added', doc: newDoc  }, '*');
	// 	}
	// });
}

if (Meteor.isServer) {
	Meteor.publish('messages', function() {
		// console.log('publishing asdf...', arguments);
		return Messages.find();
	});


	Meteor.startup(function () {
		// code to run on server at startup
		// console.log('can we get a message here?');
	});
}
