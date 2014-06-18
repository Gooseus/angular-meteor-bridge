angular.module('meteorFrame', [])
// Start of the service, needs to be FAR more comprehensive
.service('bridge', [
	function() {
		var svc = {
			queue: [],
			queueRpc: function(fn,args) {
				var rpc = {
						fn: fn,
						args: args
					};
				
				svc.queue.push(rpc);
			}
		};


		return svc;
	}
])
// Start of the directive, this should probably be an Element directive and create the iframe on the fly
.directive('meteorFrame', [
	'bridge',
	function(bridge) {
		return {
			scope: {},
			link: function($scope,$el,$attrs) {
				// console.log('whats on our iframe?', $el);
				$el.css('display','none');

				// Wait for meteor to startup
				$scope.$on('meteor::startup', function() {
					// Then start watching the bridge queue
					$scope.$watch(function() {
						return bridge.queue.length;
					}, function(qlen) {
						console.log('current queue', qlen, bridge.queue);
						if(qlen) {
							var msgs = bridge.queue.splice(0,qlen);

							msgs.forEach(function(msg) {
								$el[0].contentWindow.postMessage(msg,'*');
							});
						}
					});
				});
			}
		}
	}
]);