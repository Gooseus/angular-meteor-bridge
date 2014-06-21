## MFrame Smart Package

This package sets up a Meteor App to bind Publish/Subscribe channels to an iframe parent application.  It can also be configured to bind incoming messages to client-side Meteor functions to perform remote procedural calls (which can then be passed to Meter.call() for further server-side RPC).

### MFrame Configuration

The MFrame package is just an object which is instantiated and sets up the binding according to a configuration object passed to the constructor function.

```
new MFrame({
	collections: [ ],
	channels: {},
	api: {},
	observers: {}
});
```

#### Channels

Channels define the Meteor.Publish functions which specify how data is piped from the server

```
	channels: {
		'messages': function(params) {
			return this.collections.messages.find(params);
		},
		'lists':  function(params) {
			return this.collections.lists.find(params);
		}
	}
```

#### Collections

These are the Mongo Collections that are loaded into the Meteor environment

```
collections: [ 'messages', 'lists' ],
```

#### Observers

These are the Cursor events which are re-broadcast to the parent application via postMessage.

```
	{
		'lists': [ 'added', 'removed', 'changed' ],
		'messages': [ 'added', 'removed', 'changed' ]
	}
```

The Angular mframe directive passes those postMessage events to a $meteor service, which binds to a model that is placed on the scope.  (See Angular README for more info).

#### API

So I tried to make this like an RPC type thing where the Angular app would postMessage any kind of procedure calls that the Meteor app was configured to do.

There will be more documentation on how they're sent the Angular app README, but on the Meteor side it goes like this:

```
	api: {
		insert: function(target,doc) {
			doc.created_at = new Date();
			this.collections[target].insert(doc);
		},
		update: function(target,_id,modify) {
			modify.$set = { updated_at: new Date() };
			this.collections[target].update(_id,modify);
		},
		subscribe: function(channel,params) {
			Meteor.subscribe(channel,params);
		}
	},
```

If you are using a more conventional REST API, you pretty much don't need to worry about this.  However, if you want to build MFrame into a larger Meteor Server app implementation, you can pretty much open anything up to window.message RPC-like interface (need to use Meteor.call as the api functions from on the client).

