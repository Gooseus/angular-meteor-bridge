function pairToObj(obj,pair) { 
	if(!obj) obj = {};

	obj[pair[0]] = pair[1];
	return obj;
}

function bindFnObj(ctx,obj) {
	return Object.keys(obj)
		.map(function(key) { 
			return [ key, obj[key].bind(ctx) ];
		})
		.reduce(pairToObj)
}

MFrame = function MFrame(config) {
	var self = this;

	self.channels = bindFnObj(self,config.channels);
	self.api = bindFnObj(self,config.api);

	self.collections = {};
	config.collections.forEach(function(name){
		self.collections[name] = new Meteor.Collection(name);
	});
	
	// Object.keys(config.channels).forEach(function(key) {
	// 	self.channels[key] = config.channels[key];
	// });

	if (Meteor.isClient) {
		self.$broadcast = window.top.postMessage.bind(window.top);

		Meteor.startup(function () {
			// code to run on server at startup
			self.$broadcast({ op: 'startup' }, '*');
		});

		var observers = {
			added: function(coll) {
				return function(doc) {
					self.$broadcast({ coll: coll, op: 'added', data: doc  }, '*');
				}
			},
			removed: function(coll) {
				return function(doc) {
					self.$broadcast({ coll: coll, op: 'removed', data: doc  }, '*');	
				}
			},
			changed: function(coll) {
				return function(ndoc,odoc) {
					self.$broadcast({ coll: coll, op: 'changed', data: ndoc }, '*');
				}
			}
		};

		// Handle incoming client messages (Router goes here)
		window.onmessage = function(e) {
			var msg = e.data;
			console.log('message from angular',self.api,msg);
			if(msg.fn) {
				self.api[msg.fn].apply(null,msg.args);
			}
		};

		Object.keys(self.collections).forEach(function(coll) {
			var actions = {};

			config.observers[coll].forEach(function(name) {
				actions[name] = observers[name](coll);
			});

			self.collections[coll].find().observe(actions);
		});
	}


	if (Meteor.isServer) {
		// Publish each model to its channel on the server
		Object.keys(self.channels).forEach(function(ch) {
			Meteor.publish(ch, self.channels[ch]);
		});
	}
}
