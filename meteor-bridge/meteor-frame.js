// This stuff should be moved to a config file of some sort
Messages = new Meteor.Collection("messages");
Collections = {
	Messages: Messages
};

if (Meteor.isClient) {
	var $client = window.top,
	// Our client API
		$api = {
			insert: function(coll,doc) {
				console.log('inserting doc: ', doc, coll);
				doc.created_at = new Date();
				Collections[coll].insert(doc);
			}
		};

	// Handle incoming client messages (Router goes here)
	window.onmessage = function(e) {
		console.log('message from client',e);
		var msg = e.data;
		if(msg.fn) {
			$api[msg.fn].apply(null,msg.args);
		}
	};

	// Subscribe to the Server channels
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
}


if (Meteor.isServer) {
	// Publish server data, need to find a clever way to update the data that the server exposes to the client
	// Would definitely need to add user account management of some sort?  Or maybe just access token stuff?
	Meteor.publish('messages', function() {
		return Messages.find();
	});


	Meteor.startup(function () {
		// code to run on server at startup
	});
}
