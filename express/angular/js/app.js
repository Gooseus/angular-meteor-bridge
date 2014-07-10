var app = angular.module('tapchat.app', [ 'tapchat.services', 'ngRoute', 'ngMFrame' ])

app.controller('AppController', [
	'$rootScope', '$scope', '$route', '$meteor', '$window', '$util', '$api',
	function ($rootScope, $scope, $route, $meteor, $window, $util, $api) {
		var path = $util.locationPart('pathname').slice(1),
			// route = $util.splitPathRoute(path),
			route = path.split('/'),
			random = $util.randomId();

		$scope.chname = route[0];
		$scope.rname = route[1];

		// Meteor-aware models, attached to our scope
		$scope.messages = $meteor.createModel('messages', ['added','removed']);
		$meteor.setChannelSubscription('messages', { channel: $scope.chname });

		if($scope.rname) {
			$scope.view = '/views/client.html';
		} else {
			// validate here for admin user, and more likely, make admin area a separate angular/meteor app altogether with actual auth
			$scope.view = '/views/admin.html';
		}

		// Create client message
		$scope.createMessage = function(text, room, channel) {
			if(!text) {
				alert('gotta enter a message to send!');
				return;
			}

			var msg = {
				text: text,
				channel: channel,
				room: room,
				user: $rootScope.user.name
			};

			$meteor.queueRpc('insert', [ 'messages', msg ]);

			delete $scope.msg;
		};
	}
]);

app.controller('ClientController', [
	'$rootScope', '$scope', '$meteor',
	function($rootScope,$scope,$meteor) {
		// TODO: add option to save user (cookie? or server with auth?)
		$rootScope.user = {
			rando: random,
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
			admin: true,
			name: 'TA-Admin'
		};

		$scope.rooms = $meteor.createModel('rooms', ['added','removed']);
		$meteor.setChannelSubscription('rooms', { channel: $scope.chname });

		$scope.toggleRoom = function(room) {
			$rootScope.active[room.url] = room.active = !room.active;
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