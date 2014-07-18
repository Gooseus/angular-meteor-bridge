var app = angular.module('tapchat.app', [ 'tapchat.services', 'ngMFrame', 'ngCookies' ])

app.controller('AppController', [
	'$rootScope', '$scope', '$meteor', '$window', '$location', '$util', '$api',
	function ($rootScope, $scope, $meteor, $window, $location, $util, $api) {
		// var path = $util.locationPart('hash').slice(1),
		// 	// route = $util.splitPathRoute(path),
		// 	route = path.split('/');

		$scope.chname = window.location.pathname.slice(1).split('/')[0] || 'tapchat';

		console.log('chname', $scope.chname);

		$scope.$watch(function() {
			return window.location.hash;
		}, function(hash) {
			if(hash) {
				var route = hash.slice(2).split('?')[0].split('/');

				console.log('testing location watch', hash, route);

				$scope.rname = route[0];
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
	'$rootScope', '$scope', '$meteor', '$cookieStore',
	function($rootScope,$scope,$meteor,$cookieStore) {
		// TODO: add option to save user (cookie? or server with auth?)
		console.log('loading client controller');
		var _user;

		$scope.saveUser = function(name) {
			$rootScope.user.name = name;
			$cookieStore.put('tc_usr', JSON.stringify($rootScope.user));
		}

		$scope.$watch('rname', function(rname) {
			if(rname) {

				if(_user = $cookieStore.get('tc_usr')) { 
					$rootScope.user = JSON.parse(_user);
				} else {
					var random = Math.random().toString(32).slice(2);

					$rootScope.user = {
						_id: random,
						name: prompt('Name for Chatroom ' + rname, 'rando-' + random) || 'rando-' + random
					};
				}

				$scope.$watch(function() {
					return $rootScope.user.name;
				}, $scope.saveUser);

				$meteor.setChannelSubscription('messages', { channel: $scope.chname, room: $scope.rname });
			}
		});
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
		$meteor.setChannelSubscription('messages', { channel: $scope.chname });

		$scope.toggleRoom = function(room) {
			$rootScope.active[room.url] = room.active = !room.active;
		};

		$scope.changeRoom = function(room) {
			$scope.room = room;
		}

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