## AngularJS App

Simple Angular app demonstrating the MEMA stack architecture.  This is a variation on the MESA (Monge-Express-Sock(js/et.io)-Angular) stack which is a flavor of the emerging pattern where there are two client-server communication models used by the application, a typical REST-like API over HTTP and the data push API over WebSockets.

A simple custom-rolled `$api` service is used here to communicate with the REST-like API served by a standard Express app.

The ngMFrame module provides the `$meteor` service which provides a way to create reactive models bound to Meteor's publish/subscribe architecture through the `mframe` directive.

### ngMFrame

This module is the unique part of this exampel app and should be in it's own repo.  Comes with 2 components `$meteor` service and `mframe` directive.

#### $meteor service

Provides the interface for an Angular App to bind to reactive Meteor data.  Requires an mframe to establish communication with the remote Meteor app.

#### mframe directive

This directive currently plugs into an iframe pointed at a Meteor app and facilitates passing queued remote procedure calls to the Meteor application