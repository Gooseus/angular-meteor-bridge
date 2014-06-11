angular.module('ngMeteorBridge', [])
.service('bridge', [
	function() {
		return {};
	}
])
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