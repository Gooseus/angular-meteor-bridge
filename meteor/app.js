// This is what's gonna go in my super simple smart package!
// function connectMFrame(config) {
// 	var mFrame = {
// 		collections: {},
// 		channels: {}
// 	};

// 	config.collections.forEach(function(name){
// 		mFrame.collections[name] = new Meteor.Collection(name);
// 	});
	
// 	Object.keys(config.channels).forEach(function(key) {
// 		mFrame.channels[key] = config.channels[key];
// 	});

// 	mFrame.router = config.router;

// 	if (Meteor.isClient) {
// 		var $client = window.top,
// 			observers = {
// 				added: function(coll) {
// 					return function(doc) {
// 						$client.postMessage({ coll: coll, op: 'added', data: doc  }, '*');
// 					}
// 				},
// 				removed: function(coll) {
// 					return function(doc) {
// 						$client.postMessage({ coll: coll, op: 'removed', data: doc  }, '*');	
// 					}
// 				},
// 				changed: function(coll) {
// 					return function(ndoc,odoc) {
// 						$client.postMessage({ coll: coll, op: 'changed', data: ndoc }, '*');
// 					}
// 				}
// 			};

// 		// Handle incoming client messages (Router goes here)
// 		window.onmessage = function(e) {
// 			var msg = e.data;
// 			console.log('message from angular',mFrame.router,msg);
// 			if(msg.fn) {
// 				mFrame.router[msg.fn].apply(null,msg.args);
// 			}
// 		};

// 		Object.keys(mFrame.collections).forEach(function(coll) {
// 			var actions = {};

// 			config.observers[coll].forEach(function(name) {
// 				actions[name] = observers[name](coll);
// 			});

// 			mFrame.collections[coll].find().observe(actions);
// 		});

// 		Meteor.startup(function () {
// 			// code to run on server at startup
// 			$client.postMessage({ op: 'startup' }, '*');
// 		});
// 	}

// 	if (Meteor.isServer) {
// 		Object.keys(mFrame.channels).forEach(function(ch) {
// 			// console.log('publishing', ch, mFrame.Channels[ch])
// 			Meteor.publish(ch, mFrame.channels[ch]);
// 		});
// 	}

// 	return mFrame;
// }



// This is where you configure your meteor frame



mFrame = connectMFrame({
	collections: [ 'messages', 'lists' ],
	channels: {
		'messages': function(params) {
			console.log('what are publishing again?', params);
			// I suppose this is where we'd do a check, but everything is public for now
			return mFrame.collections['messages'].find(params);
		},
		'lists':  function(params) {
			console.log('what are publishing again?', params);
			// I suppose this is where we'd do a check, but everything is public for now
			return mFrame.collections['lists'].find(params);
		}
	},
	router: {
		insert: function(coll,doc) {
			console.log('inserting doc: ', doc, coll);
			doc.created_at = new Date();
			mFrame.collections[coll].insert(doc);
		},
		update: function(coll,_id,modify) {
			console.log('updating doc: ', _id, coll, modify);
			modify.$set = { updated_at: new Date() };
			mFrame.collections[coll].update(_id,modify);
		},
		subscribe: function(channel,params) {
			// Subscribe to the Server channels
			console.log('setting a subscription', channel, params);

			// TODO we should check the channel against the configuration and send back an error if it's not configured
			Meteor.subscribe(channel,params);
		}
	},
	observers: {
		'lists': [ 'added', 'removed', 'changed' ],
		'messages': [ 'added', 'removed', 'changed' ]
	}
});
