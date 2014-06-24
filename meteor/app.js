// This is the entire Meteor app side of the iframe (mframe)
// Initialize the MFrame with output channels and the input api
new MFrame({
	collections: [ 'messages', 'games' ],
	// These specify which channels we publish from the server
	// TODO change to publish to match with Meteor api
	channels: {
		'messages': function(params) {
			console.log('what are publishing again?', params);
			// I suppose this is where we'd do a check, but everything is public for now
			return this.collections.messages.find(params);
		},
		'games':  function(params) {
			console.log('what are publishing again?', params);
			// I suppose this is where we'd do a check, but everything is public for now
			return this.collections.games.find(params);
		}
	},
	// This is the API we're listening to from outside the iframe
	api: {
		// Perform miniMongo operations from the client side (can't use complex queries, those need to go through separate channel to DB)
		// These can always go through another service to update the database
		insert: function(target,doc) {
			console.log('inserting doc: ', doc, target);
			doc.created_at = new Date();
			this.collections[target].insert(doc);
		},
		update: function(target,_id,modify) {
			console.log('updating doc: ', _id, target, modify);
			modify.$set = { updated_at: new Date() };
			this.collections[target].update(_id,modify);
		},
		// Subscribe to the Server channels
		// We definitely need this one for reactive stuff
		subscribe: function(channel,params) {
			console.log('setting a subscription', channel, params);
			// TODO we should check the channel against the configuration and send back an error if it's not configured
			Meteor.subscribe(channel,params);
		}
	},
	// These specify which Cursor events we broadcasting outside the mframe
	// TODO all optional, or mandatory with standard forms for specifying function to run before broadcasting data
	// change name ? broadcasts?
	observers: {
		'games': [ 'added', 'changed' ],
		'messages': [ 'added', 'removed', 'changed' ]
	}
});
