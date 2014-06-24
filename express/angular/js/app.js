var app = angular.module('listverse.app', [ 'listverse.services', 'ngMFrame', 'ngRoute' ])

app.config([ '$routeProvider', '$locationProvider', '$httpProvider',
	function ($routeProvider, $locationProvider, $httpProvider) {
		$routeProvider
			.when('/', { 
				templateUrl: '/views/home.html',
				controller: 'HomeCtrl'
			})
			.when('/game/:id', { 
				templateUrl: '/views/game.html',
				controller: 'GameCtrl'
			});
		
		$locationProvider.html5Mode(true);
	}
]);

app.controller('AppController', [
	'$rootScope', '$scope', '$routeParams', '$meteor', '$window', '$util', '$api',
	function ($rootScope, $scope, $routeParams, $meteor, $window, $util, $api) {
		var path = $util.locationPart('pathname').slice(1),
			route = $util.splitPathRoute(path),
			random = $util.randomId();

		// save rando id in cookie until signup?
		$scope.user = {
			rando: random,
			name: 'anonyrand-' + random
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
.controller('HomeCtrl', [
	'$scope', '$meteor', '$api', '$location',
	function($scope,$meteor, $api, $location) {
		$scope.createGame = function() {
			var id = Date.now().toString('16') + (Math.random()*10000).toString('16').split('.')[0],
				game = {
					id: id,
					name: prompt('Name your game:'),
				};

			console.log('creating new game', game.name, game.id);

			if(!game.name) {
				alert('gotta give your game a name!');
				return;
			}

			// TODO - Switch to API
			$meteor.queueRpc('insert', [ 'games', game ]);
			$location.path('game/'+id);
		};
	}
])
.controller('GameCtrl', [
	'$scope','$meteor','$routeParams',
	function($scope,$meteor,$routeParams) {
		console.log('starting the params', $routeParams);

		// basic routing type stuff
		$scope.game_id = $routeParams.id;
		$scope.channel = 'main';

		// Meteor-aware models, attached to our scope
		$scope.messages = $meteor.createModel('messages', ['added','removed']);
		$scope.game = $meteor.createModel('games', [ 'added', 'changed']);

		// Subscribe to a $meteor model channel with parameters
		// this should also be configurable as a provider rather than service, optionally
		// should also be a factory to pass in variables for multiple mframes (meteor-iframes)
		$meteor.setChannelSubscription('messages', { game: $scope.game_id, channel: $scope.channel });
		$meteor.setChannelSubscription('games', { id: $scope.game_id });

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
				game: $scope.game_id,
				user: $scope.user.name
			};

			$meteor.queueRpc('insert', [ 'messages', msg ]);

			delete $scope.msg;
		};
	}
])
;