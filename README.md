# Angular-Meteor Bridge

This is my attempt to integrate Meteor's DDP/minMongo system as a data service, much like $resource, in to a clean Angular environment.

### Why?

**tl;dr I mostly agree with Meteors design principles, but take enormous issue with the tight coupling of the backend data-service and frontend templating system and the promotion of a separate packaging system for their own ecosystem.**

Well, Meteor is awesome, but not for all the reasons the Meteor community thinks.  It does some things really well and is really powerful... but other aspects are done better elsewhere (IMO).

Lets take a look at [Meteors 7 Principles](http://docs.meteor.com/#sevenprinciples):

##### Data on the Wire**
Don't send HTML over the network. Send data and let the client decide how to render it.  
*Couldn't agree more.  Of course, what they really mean is "let our Blaze templating system decide how to render it".*

##### One Language
Write both the client and the server parts of your interface in JavaScript.  
*That's fine with me, personally, but wouldn't it be better if you could leverage this sweet technology in multiple languages/architectures?*

##### Database Everywhere
Use the same transparent API to access your database from the client or the server.  
*I can dig it*

##### Latency Compensation
On the client, use prefetching and model simulation to make it look like you have a zero-latency connection to the database.  
*Yup, this is what they do REALLY well.*

##### Full Stack Reactivity
Make realtime the default. All layers, from database to template, should make an event-driven interface available.  
*I would say that realtime data should be made available when needed, but whatever, so long as both the value and the cost are taken in to account.*

#### Embrace the Ecosystem
Meteor is open source and integrates, rather than replaces, existing open source tools and frameworks.  
*This is where they lose me.  They mean Meteor allows integration of existing open source tools and frameworks... so long as you embrace their ecosystem.  I already embraced an ecosystem, it's called NPM and the client-side module system in Angular is the best I've seen.  Why couldn't Meteor just be a client-side library and NPM module again?*

#### Simplicity Equals Productivity
The best way to make something seem simple is to have it actually be simple. Accomplish this through clean, classically beautiful APIs.  
*I agree.  Though I think our definitions of Simple may not the same.  What I think they mean is Easy, [Rich Hickey - Simple Made Easy](http://www.infoq.com/presentations/Simple-Made-Easy).*  
  
*Once you learn the ecosystem and the Meteor pattern, everything is suddenly easy, but that doesn't mean things are simple.*  
  
*Simple is not intertwining the Server and Client environments, that is complex, even if the beautiful APIs make it look easy.*

So those are my current opinions on Meteor, you can watch a video on [Angular Design Principles](https://www.youtube.com/watch?v=HCR7i5F5L8c) if you so choose, I'll try and outline the principles later and hopefully come up with a synthesis of the two that makes the case for combining the principles.  Basically - decoupling is good, Angular is very decoupled, Meteor is not.

My goal in going through this lengthy explanation is two-fold.  One, I'm trying to express my thoughts for my own benefit and learning; second, I'm hoping to engage a wider audience about with an honest discussion of the benefits and detriments of both libraries.

My goal in building this project is to learn more about the deeper patterns possible with both systems and hope to create something that, if not intrinsically useful, will help inspire more people to look at both technologies.

### My Approach - Putting Meteor in a Bottle

My approach is basically to make a very simple Meteor app and contain it within an iframe.  Then build a bridge between an Angular service and the iframed Meteor environment.

The directive will load the iframe with the Meteor app and connect the service which will then be shared throughout the Angular app as a data-access layer, much like `$resource`.

I'm still not sure what the API is gonna look like and I'm debating sending/receiving messages to/from the Meteor app and ignoring the Express app that serves Angular, or building a RESTful API in to the Express app Angular and simply plug Meteor's observe events for collections in to Angular $scope models.

One approach would treat the Meteor iframe as the server and put more data logic into Meteor.  The other would treat Meteor like a reactive data layer and send data through the Express app, making a more circular data pattern.

### Goals

* Build the Meteor app in to a single Smart Package with config file which sets up the entire data bridge and hook all the Meteor Collection methods to iframe postMessage calls.
* Build the Angular module to expose the entire Meteor Collection API as a service which communicates via postMessage to the Meteor app within an iframe.

### Is this all really necessary?

Is anything really necessary?  I, personally, want to see what I can make happen and so far I'm liking how things are coming together, though I've barely scratched the surface.  More soon.

## Documentation

The angular app is in `angular`, the meteor app is in `meteor`.

You will need to run both, angular-app defaults to port 8000, meteor always defaults to port 3000.  The angular-app has the meteor-bridge hardcoded to localhost:3000.

## The Test App

The test app is actually something I've always wanted to have, and perhaps exists in the wild somewhere, though I'm looking to create the simplest form possible.

Right now there is a working Simple Chat app, if you go to localhost:3000/room/[ room key ] your messages will only be broadcast to other people connected to that room.  Basically a really simple IRC without any of the other cool stuff.