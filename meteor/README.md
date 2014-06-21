## Meteor MFrame App

This is an implementation of an mframe based application.  This means that the Meteor app is simply a thin interface on top of the miniMongo Collection and Cursor APIs.

### Sending Data

#### Broadcasting



### Receiving Commands

So I tried to make this like an RPC type thing where the Angular app would postMessage any kind of procedure calls that the Meteor app was configured to do.

There will be more documentation on how they're sent the Angular app README, but on the Meteor side it goes like this:

#### the MFrame holds the api object
This is configured on instantiation and can basically run anything on the client side, which combined with Meteor.call basically could if you wanted

```
new MFrame({
	...
	api: {
		// Perform miniMongo operations from the client side (can't use complex queries, those need to go through separate channel to DB)
		// These can always go through another service to update the database
		insert: function(target,doc) {
			doc.created_at = new Date();
			this.collections[target].insert(doc);
		},
		update: function(target,_id,modify) {
			modify.$set = { updated_at: new Date() };
			this.collections[target].update(_id,modify);
		},
		// Subscribe to the Server channels
		// We definitely need this one for reactive stuff
		subscribe: function(channel,params) {
			Meteor.subscribe(channel,params);
		}
	},
	...
```

This means that messages sent with those function keys will be run with the arguments provided.