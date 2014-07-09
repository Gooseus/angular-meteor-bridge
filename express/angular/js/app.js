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

		// save rando id in cookie until signup?
		$scope.user = {
			rando: random,
			name: 'rando-' + random
		};

		// Meteor-aware models, attached to our scope
		$scope.messages = $meteor.createModel('messages', ['added','removed']);

		if($scope.rname) {
			$scope.view = '/views/client.html';
		} else {
			// validate here for admin user, and more likely, make admin area a separate angular/meteor app altogether with actual auth
			$scope.view = '/views/admin.html';
		}
	}
]);

app.controller('ClientController', [
	'$rootScope', '$scope', '$meteor',
	function($rootScope,$scope,$meteor) {
		$meteor.setChannelSubscription('messages', { channel: $scope.chname, room: $scope.rname });
		
		// Create client message
		$scope.createMessage = function(text, room, channel) {
			if(!text) {
				alert('gotta enter a message to send!');
				return;
			}

			var msg = {
				text: text,
				channel: channel,
				room: rname,
				user: $scope.user.name
			};

			$meteor.queueRpc('insert', [ 'messages', msg ]);

			delete $scope.msg;
		};
	}
])

app.controller('AdminController', [
	'$rootScope', '$scope', '$meteor',
	function($rootScope,$scope,$meteor) {
		$scope.rooms = $meteor.createModel('rooms', ['added','removed']);
		$meteor.setChannelSubscription('rooms', { channel: $scope.chname });

		$scope.$watch(function() {
			return $scope.rooms.collection.length;
		}, function(next) {
			console.log('do we have rooms?', next)
		})

		$scope.toggleRoom = function(room) {
			// Do I need to toggle the last room off?
			// I need to be able to also count the messages I'm getting and put up multiple rooms
			$meteor.setChannelSubscription('messages', { channel: $scope.chname, room: room.url });
		};
	}
])

;