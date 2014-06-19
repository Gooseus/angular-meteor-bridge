var app = angular.module('meteorFrameApp', [ 'meteorFrame' ])

// test application for this madness
// gonna try and build a shared list manager so other people can add things to your list
// basically like reddit crossed with todoist
app.factory('Utility', [
	'$location',
	function($location) {
		var parser = document.createElement('a');

		return {
			inColl: function(coll,key,val) {
				var len = coll.length;
				for(var i=0;i<len;i++) {
					if(coll[i][key]==val) {
						return i;
					}
				}
				return -1;
			},
			locationPart: function(part) {
				parser.href = $location.absUrl();
				return parser[part];
			}
		}
	}
]);

// Angular-side Model
app.factory('Messages', [
	'Utility',
	function(Utility) {
		// Is this a prototype perhaps?
		var svc = {
			collection: [],
			added: function(doc) {
				var idx = Utility.inColl(svc.collection,'_id',doc._id);
				
				if(idx===-1) {
					svc.collection.push(doc);
				}
			},
			removed: function(doc) {
				var idx = Utility.inColl(svc.collection,'_id',doc._id);
				
				if(idx!==-1) {
					svc.collection.splice(idx,1);
				}
			}
		};

		return svc;
	}
]);

// Angular-side Model
app.factory('Lists', [
	'Utility', '$rootScope',
	function(Utility, $rootScope) {
		// This is definitely some sort of prototype or should be made from a factory
		var svc = {
			collection: [],
			added: function(doc) {
				var idx = Utility.inColl(svc.collection,'_id',doc._id);
				
				console.log('adding new list doc', doc, idx);
				if(idx===-1) {
					svc.collection.push(doc);
				}
			},
			removed: function(doc) {
				var idx = Utility.inColl(svc.collection,'_id',doc._id);
				
				if(idx!==-1) {
					svc.collection.splice(idx,1);
				}
			},
			changed: function(doc) {
				var idx = Utility.inColl(svc.collection,'_id',doc._id);
				
				if(idx!==-1) {
					angular.extend(svc.collection[idx], doc);
				}
			}
		};

		return svc;
	}
]);

// TODO: Change `bridge` to `$miniMongo` ?  Maybe create multiple services for the pattern?
// $miniMongo for those that just want client Mongo api
// $meteor for a more comprehensive api to a Meteor backend server?

app.controller('AppController', [
	'$rootScope', '$scope', 'bridge', 'Utility', 'Messages', 'Lists',
	function ($rootScope, $scope, bridge, Utility, Messages, Lists) {
		$scope.user = {};
		$scope.Messages = Messages;
		$scope.Lists = Lists;

		var path = Utility.locationPart('pathname').slice(1),
			roomMatch = path.match(/room\/(\w+)/),
			room = !!roomMatch ? roomMatch[1] : !!roomMatch;
		
		console.log('our path', path, room);
		

		// Our client-side message router
		window.onmessage = function(e) {
			var msg = e.data;

			console.log('message from meteor', msg);
			// If we have a collection, its a model opertation
			// this should be more functional still
			if(msg.coll) {
				var model = $scope[msg.coll];
				$scope.$apply(function() {
					model[msg.op](msg.data);
				});
			} else {
				// if no collection, lets just broadcast the operation
				console.log('meteor event broadcasted', msg.op);
				$scope.$apply(function() {
					$rootScope.$broadcast('meteor::'+msg.op, msg.data);	
				});
			}
			// console.log('message from server', msg);
		};


		$scope.setSubscription = function(channel, params) {
			bridge.queueRpc('setSubscription', [ channel, params ]);
		};

		// This needs to be a method on the meteor services?
		$scope.sendMessage = function(text) {
			if(!text) {
				alert('gotta enter a message to send!');
				return;
			}

			var msg = {
				text: text,
				room: room,
				user: $scope.user.name || 'anonymous'
			};

			bridge.queueRpc('insertDocument', [ 'Messages', msg ]);

			delete $scope.msg;
		};

		$scope.createList = function() {
			var list = {
				name: prompt('Name your list:'),
				uri: room
			};

			console.log('creating new list', list.name);

			if(!list.name) {
				alert('gotta give your list a name!');
				return;
			}

			bridge.queueRpc('insertDocument', [ 'Lists', list ]);
		};

		$scope.addItem = function(list) {
			// We need to modify an item on a document here... that's a different call from insertDocument, so lets create that next level url shit
			// updateDocument ?  insertSubDocument ?
			
			var item = {
				text: prompt('Add item to '+list.name),
				votes: 0,
				comments: []
			};

			bridge.queueRpc('updateDocument', [ 'Lists', list._id, { $addToSet: { 'items': item } } ]);
		};

		$scope.setSubscription('messages', { room: room });
		$scope.setSubscription('lists', { uri: room });
	}
]);
;