angular.module('listverse.services', [])
.factory('$util', [
	'$location',
	function($location) {
		var parser = document.createElement('a');

		return {
			locationPart: function(part) {
				parser.href = $location.absUrl();
				return parser[part];
			},
			randomId: function() {
				return Math.floor(Date.now()/1000).toString('16'); + Math.floor(Math.random()*1000).toString('16');
			}
		};
	}
])
.service('$api', [
	'$q','$http','$rootScope',
	function($q,$http,$rootScope) {
		var api = {
			'baseUrl': '/api/v1/',
			'success': function(res) {
				var payload = res.data,
					_res = $q.defer();

				if(payload.data) {
					_res.resolve(payload.data);
				} else {
					if(payload.errCode) {
						_res.reject(payload.errCode+ ': ' +payload.msg);
					} else {
						_res.reject('unknown api error');
					}
				}

				if(!$rootScope.$$phase) {
					$rootScope.$digest();
				}
				
				return _res.promise;
			},
			'error': function(res) {
				// Use toaster here
				if(typeof res.data == 'string') {
					alert(res.data);
				} else {
					if(typeof res.data ==='object' && res.data !== null) {
						alert(res.data.msg);
					}
				}
			},
			'call': function(method,url,data) {
				var opts = {
					method: method.toUpperCase(),
					url: this.baseUrl+url
				};

				if(data) {
					if(method=='post') {
						opts.data = data;
					} else if(method=='get') {
						opts.params = data;
					}
				}
				console.log('api call', opts);
				return $http(opts).then(api.success, api.error);
			},
			'post': function(url,data) {
				return api.call('post', url, data);
			},
			'get': function(url,data) {
				return api.call('get', url, data);
			}
		};

		return api;
	}
])
;