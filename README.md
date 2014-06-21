## Angular Meteor Frame
### iframe interface for piping data between angular and meteor apps

Comes with:
* mframe directive for wrapping the $meteor interface around an iframe pointed at a Meteor app
* $meteor service which exposes the mframe interface throughout an Angular app
* mframe smart package which configures a Meteor app to publishes data and listens for RPC-like messages through the iframe

Both the Angular and Meteor side communicate via window.postMessage wrapped methods

## Documentation

#### Getting Started

To download these libaries, right now just clone/fork the test app and start picking apart, I'll get to each section further along.

```
git clone git@github.com:Gooseus/angular-meteor-bridge.git
```

##### Install and Run Meteor App
First make sure Meteor and Meteorite are installed, then

```
cd angular-meteor-bridge/meteor/
mrt add mframe
mrt install
mrt
```

This will start the meteor iframe app at localhost:3000 and connect to mongo at localhost:3001/meteor.

##### Install and Run Express App

```
cd angular-meteor-bridge/angular/
npm install
node app.js
```

This will start the express app at localhost:8000 and also connect to mongo at localhost:3001/meteor.

Now try going to localhost:8000 and the Express app will serve the Angular app which will connect to Meteor app localhost:3000.

Create a list, create items, vote, comment, chat.  All these things currently get mongo data from listening to the Meteor app and put data in the mongo server through both the Express app and the mframe postMessage faux-RPC.

Check out the respective application folders for more information on what each does and how

## Example App - Listverse
The example app is a twist on the typical todo list example.

In this app you create lists which can then be individually shared with other people so they can add items or comment/vote on other items.  The owner of the list completes the item and banks the votes as points.

There is also a channel-based chat for each list so there can be more in-depth discussions, however this may either be redundant or render the comments as redundant (probably the latter)

### Is this all really necessary?

After some more work being put in, I don't think it's necessary no.  But it is pretty damn cool, with some more development I think you could do interesting things.

Here's how I see things:

* Meteor app is basically just a reactive layer which can act as a data pump, much like a web socket api would.  Meteor comes with the miniMongo interface though, which allows you to pipe mongo data directly in to a client side handler.

* Express app can act as a very fast static angular app server and build in a much more flexible server API which can be easily replaced by any other server implementation that is plugged in to the same DB as Meteor.

* Angular app provides the perfect client-side architecture which provides elegant two-way data binding to/from any source and the presentation layer.

I think that what these modules provide is a way to expand choices in the new age of sockets.  They provide one demonstration in how the power of the Meteor framework can be made simpler and blended with the elegance of Angular and the choice of any additional server framework you want.

