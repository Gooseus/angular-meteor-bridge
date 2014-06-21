var app = angular.module('listverse.app', [ 'listverse.services', 'ngMFrame' ])

app.controller('AppController', [
	'$rootScope', '$scope', '$meteor', '$window', '$util', '$api',
	function ($rootScope, $scope, $meteor, $window, $util, $api) {

		var random = $util.randomId();

		// save rando id in cookie until signup?
		$scope.user = {
			rando: random,
			name: 'anonyrand-' + random
		};

		// subscribe to chat messages for verse / channel
		// find channel

		function pathRoute(paths) {
			var route = {},
				plen = paths.length;

			for(var i=0;i<plen;i+=2) {
				route[paths[i]] = paths[i+1];
			}

			return route;
		}

		var paths = $util.locationPart('pathname').slice(1).split('/'),
			route = pathRoute(paths);

		// basic routing type stuff
		$scope.verse = route.verse || 'home'; // the home listverse!
		$scope.channel = route.channel || 'lists';

		// Meteor-aware models, attached to our scope
		$scope.messages = $meteor.createModel('messages', ['added','removed']);
		$scope.lists = $meteor.createModel('lists', ['added','removed','changed']);

		// Subscribe to a $meteor model channel with parameters
		// this should also be configurable as a provider rather than service, optionally
		// should also be a factory to pass in variables for multiple mframes (meteor-iframes)
		$meteor.setChannelSubscription('messages', { verse: $scope.verse, channel: $scope.channel });
		$meteor.setChannelSubscription('lists', { verse: $scope.verse });

		// UX model stuff
		$scope.expandedComments = {};

		// Meteor-based controls
		// These should actually all be $api based and avoid passing data in to the mframe, just listen for it coming out
		$scope.createMessage = function(text) {
			if(!text) {
				alert('gotta enter a message to send!');
				return;
			}

			var msg = {
				text: text,
				channel: $scope.channel,
				verse: $scope.verse,
				user: $scope.user.name
			};

			$meteor.queueRpc('insert', [ 'messages', msg ]);

			delete $scope.msg;
		};

		$scope.createList = function() {
			var list = {
				name: prompt('Name your list:'),
				verse: $scope.verse
			};

			console.log('creating new list', list.name);

			if(!list.name) {
				alert('gotta give your list a name!');
				return;
			}

			$meteor.queueRpc('insert', [ 'lists', list ]);
		};

		$scope.addItem = function(list) {
			var item = {
				_id: $util.randomId(),
				text: prompt('Add item to '+list.name),
				votes: 0,
				comments: []
			};

			$meteor.queueRpc('update', [ 'lists', list._id, { $addToSet: { 'items': item } } ]);
		};

		$scope.removeItem = function(list,item) {
			if(confirm('Sure you want to remove this item?  You will also lose all votes and comments.')) {
				$meteor.queueRpc('update', [ 'lists', list._id, { $pull: { 'items': { '_id': item._id } } } ]);
			}
		}

		// API-based controls
		$scope.upvote = function(list,item) {
			$api.post('list/'+list._id+'/item/'+item._id+'/vote')
				.then(function() {
					console.log('returned item?', arguments);
				}, function(err){
					console.log('upvote error', err);
				});
		};

		$scope.comment = function(list,item,comment) {
			$api.post('list/'+list._id+'/item/'+item._id+'/comment', { comment: comment, user: $scope.user })
				.then(function() {
					console.log('returned item?', arguments);
				}, function(err){
					console.log('upvote error', err);
				});
		};

		$scope.toggleComplete = function(list,item) {
			$api.post('list/'+list._id+'/item/'+item._id+'/complete', { item: item })
				.then(function() {
					console.log('returned item?', arguments);
				}, function(err){
					console.log('upvote error', err);
				});
		};
	}
])
;