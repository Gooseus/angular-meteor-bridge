angular.module('ngMeteorBridge', [])
// Start of the service, needs to be FAR more comprehensive
.service('bridge', [
	function() {
		return {};
	}
])
// Start of the directive, this should probably be an Element directive and create the iframe on the fly
.directive('mrtBridge', [
	'bridge',
	function(bridge) {
		return {
			scope: {},
			link: function($scope,$el,$attrs) {
				// console.log('whats on our iframe?', $el);
				$el.css('display','none');
				
				$scope.$watch(function() {
					return bridge.channel;
				}, function(msg) {
					if(msg) {
						console.log('posting message to iframe', msg);
						$el[0].contentWindow.postMessage(msg,'*');
						delete bridge.channel;
					}
				});
			}
		}
	}
]);