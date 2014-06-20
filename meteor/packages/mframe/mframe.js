connectMFrame = function(config) {
	var mFrame = {
		collections: {},
		channels: {}
	};

	config.collections.forEach(function(name){
		mFrame.collections[name] = new Meteor.Collection(name);
	});
	
	Object.keys(config.channels).forEach(function(key) {
		mFrame.channels[key] = config.channels[key];
	});

	mFrame.router = config.router;

	if (Meteor.isClient) {
		var $client = window.top,
			observers = {
				added: function(coll) {
					return function(doc) {
						$client.postMessage({ coll: coll, op: 'added', data: doc  }, '*');
					}
				},
				removed: function(coll) {
					return function(doc) {
						$client.postMessage({ coll: coll, op: 'removed', data: doc  }, '*');	
					}
				},
				changed: function(coll) {
					return function(ndoc,odoc) {
						$client.postMessage({ coll: coll, op: 'changed', data: ndoc }, '*');
					}
				}
			};

		// Handle incoming client messages (Router goes here)
		window.onmessage = function(e) {
			var msg = e.data;
			console.log('message from angular',mFrame.router,msg);
			if(msg.fn) {
				mFrame.router[msg.fn].apply(null,msg.args);
			}
		};

		Object.keys(mFrame.collections).forEach(function(coll) {
			var actions = {};

			config.observers[coll].forEach(function(name) {
				actions[name] = observers[name](coll);
			});

			mFrame.collections[coll].find().observe(actions);
		});

		Meteor.startup(function () {
			// code to run on server at startup
			$client.postMessage({ op: 'startup' }, '*');
		});
	}

	if (Meteor.isServer) {
		Object.keys(mFrame.channels).forEach(function(ch) {
			// console.log('publishing', ch, mFrame.Channels[ch])
			Meteor.publish(ch, mFrame.channels[ch]);
		});
	}

	return mFrame;
}
