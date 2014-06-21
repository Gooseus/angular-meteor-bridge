## The Express REST-like API and Static Server

This is a pretty standard Express 4 app that handles serving static content (including the Angular App) and exposes a REST-like API for the Mongo data and handling any other standard server functions / processing.

### MongoDB Driver

I used MongoJS here, it's pretty cool, personally feeling kind of anti-ORM right now, but you can use Mongoose, Mongous, the native driver or whatever you want.

### Demo App - Shared Enrichment/Media Lists

The demo app here allows someone to create lists with items, much like the standard todo list, however, your lists can be saved and each list can also be shared with other people so they can add items, vote on items and comment.  Each list also comes with it's own chatroom for extended conversation on lists, items and orders.

It doesn't have a name yet, toying with ListVerse, MediaqQueues, RecommendList, Listeme, though they all suck.  It's basically Trello crossed with Reddit with a way dialed back UI and functionality geared toward a people sharing media recommendations.