// This stuff should be moved to a config file of some sort
Messages = new Meteor.Collection("messages");
Lists = new Meteor.Collection("lists");

Collections = {
	Messages: Messages,
	Lists: Lists
};
Channels = {
	'messages': function(params) {
		console.log('what are publishing again?', params);
		// I suppose this is where we'd do a check, but everything is public for now
		return Messages.find(params);
	},
	'lists': function(params) {
		return Lists.find(params);
	}
}

if (Meteor.isClient) {
	var $client = window.top,
	// Our client API
		$api = {
			insertDocument: function(coll,doc) {
				console.log('inserting doc: ', doc, coll);
				doc.created_at = new Date();
				Collections[coll].insert(doc);
			},
			updateDocument: function(coll,_id,modify) {
				console.log('updating doc: ', _id, coll, modify);
				modify.$set = { updated_at: new Date() };
				Collections[coll].update(_id,modify);
			},
			setSubscription: function(channel,params) {
				// Subscribe to the Server channels
				console.log('setting a subscription', channel, params);

				// TODO we should check the channel against the configuration and send back an error if it's not configured
				Meteor.subscribe(channel,params);
			}
		};


	Meteor.startup(function () {
		// code to run on server at startup
		$client.postMessage({ op: 'startup' }, '*');
	});


	// Handle incoming client messages (Router goes here)
	window.onmessage = function(e) {
		var msg = e.data;
		console.log('message from angular',msg);
		if(msg.fn) {
			$api[msg.fn].apply(null,msg.args);
		}
	};

	// Listen to new additions to our client side collections
	Object.keys(Collections).forEach(function(coll) {
		Collections[coll].find().observe({
			added: function(doc) {
				$client.postMessage({ coll: coll, op: 'added', data: doc  }, '*');
			},
			removed: function(doc) {
				$client.postMessage({ coll: coll, op: 'removed', data: doc  }, '*');	
			},
			changed: function(ndoc,odoc) {
				$client.postMessage({ coll: coll, op: 'changed', data: ndoc }, '*');
			}
		});
	});
}


if (Meteor.isServer) {
	// Publish server data, need to find a clever way to update the data that the server exposes to the client
	// Would definitely need to add user account management of some sort?  Or maybe just access token stuff?
	// Meteor.publish('messages', function(params) {
	// 	console.log('what are publishing again?', params);
	// 	// I suppose this is where we'd do a check, but everything is public for now
	// 	return Messages.find(params);
	// });

	
	Object.keys(Channels).forEach(function(ch) {
		Meteor.publish(ch, Channels[ch]);
	});


	// Meteor.startup(function () {
	// 	// code to run on server at startup
	// });
}
