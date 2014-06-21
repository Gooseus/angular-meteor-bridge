## Meteor MFrame App

This is an implementation of an mframe based application.  This means that the Meteor app is simply a thin interface on top of the miniMongo Collection and Cursor APIs which enabled data binding between angular scope models and mongodb resources.

### Data Binding

The data binding strategy is relatively straight forward, basically you configure the MFrame package

See the (MFrame README)[] for more information

## RPC-ish

You can define an API for the Meteor app and then post RPC-like messages from parent app.