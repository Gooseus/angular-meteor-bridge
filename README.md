# Angular Meteor Bridge

I've seen a few projects attempt to integrate Angular and Meteor, but nothing has seemed overly impressive and leaves most of the UX heavy lifting to Meteor's templating system.

I disagree with this approach, since I don't think Meteors templating system is very impressive.  I'd much rather see an integration where Meteor provides their persistent DDP-based miniMongo system to the client and the client decides how to integrate the data with their framework/templating system of choice.

Since Meteor lives inside of its own world with its own packaging system and executable to run the entire application, front and back, it seems like an all or nothing approach.

This project is an attempt at one approach to leverage the power of Meteors low-latency streaming datasets within a full AngularJS front-end environment.

### Meteor in a Bottle

The approach is basically to make a very simple Meteor app and contain it within an iframe.  Then build an API in to the iframe and wrap the whole thing in an Angular directive with accompanying service.

The directive will load the Meteor app and plug in the service, and the service will be shared throughout the Angular app as a data-access layer, much like $http or $resource.

### Goals

* Build the Meteor app in to a single Smart Package with config file which sets up the entire data bridge and hook all the Meteor Collection methods to iframe postMessage calls.
* Build the Angular module to expose the entire Meteor Collection API as a service which communicates via postMessage to the Meteor app within an iframe.

### Is this all really necessary?

Honestly, I don't know.... probably not, but then again, maybe?  I'll find out and get back to you on this.

## Documentation

The angular app is in `angular-app`, the meteor app is in `meteor-bridge`.  That should be enough to get started, more coming soon.