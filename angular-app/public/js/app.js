var app = angular.module('bridgeTest', [ 'ngMeteorBridge' ])

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

// TODO: Change `bridge` to `$miniMongo` ?  Maybe create multiple services for the pattern?
// $miniMongo for those that just want client Mongo api
// $meteor for a more comprehensive api to a Meteor backend server?

app.controller('AppController', [
	'$rootScope', '$scope', 'bridge', 'Utility', 'Messages',
	function ($rootScope, $scope, bridge, Utility, Messages) {
		$scope.user = {};
		$scope.Messages = Messages;

		var path = Utility.locationPart('pathname').slice(1),
			roomMatch = path.match(/room\/(\w+)/),
			room = !!roomMatch ? roomMatch[1] : !!roomMatch;
		
		console.log('our path', path, room);
		
		$scope.setSubscription = function(channel, params) {
			var rpc = {
					fn: 'setSubscription',
					args: [ channel, params ]
				};
			
			bridge.queue.push(rpc);
		};

		// This needs to be a method on the meteor services?
		$scope.sendMessage = function(text) {
			if(!text) {
				alert('gotta enter a message to send!');
				return;
			}

			var msg = {},
				rpc = {
					fn: 'insertMessage',
					args: [ 'Messages', msg ]
				};

			// console.log('setting message on channel', msg);

			msg.text = text;
			msg.room = room;
			msg.user = $scope.user.name || 'anonymous';
			
			bridge.queue.push(rpc);

			delete $scope.msg;
		};

		// Our client-side message router
		window.onmessage = function(e) {
			var msg = e.data;

			// If we have a collection, its a model opertation
			// this should be more functional still
			if(msg.coll) {
				var model = $scope[msg.coll];
				$scope.$apply(function() {
					model[msg.op](msg.data);
				});
			} else {
				// if no collection, lets just broadcase the operation
				console.log('meteor event broadcasted', msg.op);
				$scope.$apply(function() {
					$rootScope.$broadcast('meteor::'+msg.op, msg.data);	
				});
			}
			// console.log('message from server', msg);
		};


		$scope.setSubscription('messages', { room: room });
	}
]);