var app = angular.module('tapchat.app', [ 'tapchat.services', 'ngRoute', 'ngMFrame' ])

app.controller('AppController', [
	'$rootScope', '$scope', '$route', '$meteor', '$window', '$location', '$util', '$api',
	function ($rootScope, $scope, $route, $meteor, $window, $location, $util, $api) {
		// var path = $util.locationPart('hash').slice(1),
		// 	// route = $util.splitPathRoute(path),
		// 	route = path.split('/');


		$scope.$watch(function() {
			return $location.hash();
		}, function(path) {
			var route = path.split('/');
			$scope.chname = route[0];
			$scope.rname = route[1];

			if($scope.rname) {
				$scope.view = '/views/client.html';
				$meteor.setChannelSubscription('messages', { channel: $scope.chname, room: $scope.rname });
			} else {
				// validate here for admin user, and more likely, make admin area a separate angular/meteor app altogether with actual auth
				$scope.view = '/views/admin.html';
				$meteor.setChannelSubscription('messages', { channel: $scope.chname });
			}
		});
		
		// Meteor-aware models, attached to our scope
		$scope.messages = $meteor.createModel('messages', ['added','removed']);

		// Create client message
		$scope.createMessage = function(text, room, channel) {
			console.log('what we gonna create', arguments);
			if(!text.msg) {
				alert('gotta enter a message to send!');
				return;
			}

			var msg = {
				text: text.msg,
				channel: channel,
				room: room,
				user: $rootScope.user
			};

			$meteor.queueRpc('insert', [ 'messages', msg ]);

			delete text.msg;
		};
	}
]);

app.controller('ClientController', [
	'$rootScope', '$scope', '$meteor',
	function($rootScope,$scope,$meteor) {
		// TODO: add option to save user (cookie? or server with auth?)
		console.log('loading client controller');
		var random = Math.random().toString(32).slice(2);
		$rootScope.user = {
			_id: random,
			name: 'rando-' + random
		};
	}
])

app
.controller('AdminController', [
	'$rootScope', '$scope', '$meteor',
	function($rootScope,$scope,$meteor) {
		$rootScope.active = {};

		$rootScope.user = {
			_id: 'ta-admin',
			admin: true,
			name: 'TA-Admin'
		};

		$scope.rooms = $meteor.createModel('rooms', ['added','removed']);
		$meteor.setChannelSubscription('rooms', { channel: $scope.chname });

		$scope.toggleRoom = function(room) {
			$rootScope.active[room.url] = room.active = !room.active;
		};

		$scope.createRoom = function() {
			var name = prompt('Name the room');

			if(name) {
				var url = name.toLowerCase().replace(/\s+/,'-').replace(/[^a-z0-9\-_~]+/,'');
				$meteor.queueRpc('insert', [ 'rooms', { url: url, name: name, channel: $scope.chname } ]);
			} else {
				alert('gotta give the channel a name');
			}
		};
	}
])
.filter('activeMessages', [
	'$rootScope', 
	function($rootScope) {
		function filterActive(i) {
			return !!$rootScope.active[i.room];
		}

		return function(input) {
			return input.filter(filterActive);
		};
	}
])
;