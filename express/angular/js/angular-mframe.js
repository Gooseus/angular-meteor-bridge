angular.module('ngMFrame', [])
// Start of the service, needs to be FAR more comprehensive
.factory('mUtil', [
	function() {
		return {
			inColl: function(coll,key,val) {
				var len = coll.length;
				for(var i=0;i<len;i++) {
					if(coll[i][key]==val) {
						return i;
					}
				}
				return -1;
			}
		}
	}
])
// TODO more abstraction, especially of the interface... require service to be configured a la $routeProvider
.service('$meteor', [
	'$rootScope', '$window', 'mUtil',
	function($rootScope, $window, mUtil) {
		var svc = {
			models: {},
			queue: [],
			queueRpc: function(fn,args) {
				var rpc = {
						fn: fn,
						args: args
					};
				
				this.queue.push(rpc);
			},
			setChannelSubscription: function(channel, params) {
				this.queueRpc('subscribe', [ channel, params ]);
			},
			getModel: function(name) {
				return this.models[name];
			},
			createModel: function(name,interfaces) {
				var self = this,
					mdl = {
						collection: []
					},
					interfaces = interfaces || Object.keys(self.modelInterfaces);

				interfaces.forEach(function(name) {
					mdl[name] = self.modelInterfaces[name](mdl.collection);
				});

				self.models[name] = mdl;

				return mdl;
			},
			// Routes data from the meteor instance to the bound scope method
			router: function(e) {
				var msg = e.data;

				// discard messages that don't come with function
				// may want to expand this more and attach specific key to detect messages, or more advanced routing scheme
				if(!msg.fn) {
					return;
				}

				console.log('message from meteor', msg);
				// If we have a collection, its a model opertation
				// this should be more functional still
				if(msg.target) {
					var model = this.models[msg.target];
					$rootScope.$apply(function() {
						model[msg.fn].apply(model, msg.args);
					});
				} else {
					// if no collection, lets just broadcast the operation
					console.log('meteor event broadcasted', msg.fn);
					$rootScope.$apply(function() {
						$rootScope.$broadcast('mframe.'+msg.fn, msg.args);	
					});
				}
			},
			modelInterfaces: {
				// leave and follow pattern of filter?
				added: function(coll) {
					return function(doc) {
						var idx = mUtil.inColl(coll,'_id',doc._id);
						
						if(idx===-1) {
							coll.push(doc);
						}
					};
				},
				removed: function(coll) {
					return function(doc) {
						var idx = mUtil.inColl(coll,'_id',doc._id);
						
						if(idx!==-1) {
							coll.splice(idx,1);
						}
					};
				},
				changed: function(coll) {
					return function(doc) {
						var idx = mUtil.inColl(this.collection,'_id',doc._id);
						
						if(idx!==-1) {
							angular.extend(this.collection[idx], doc);
						}
					};
				}
			}
		};

		// Bind the router to the window.onmessage handler which receives postMessages from any iframe
		// may want to create a way to discard non-meteor based messages
		$window.addEventListener('message', svc.router.bind(svc));

		return svc;
	}
])
// Start of the directive, this should probably be an Element directive and create the iframe on the fly
.directive('mframe', [
	'$meteor',
	function($meteor) {
		return {
			restrict: 'E',
			scope: {
				'src': '@'
			},
			template: '<iframe style="display: none;" ng-src="{{ mframe }}"></iframe>',
			replace: true,
			link: function($scope,$el,$attrs) {
				function postMessage(msg) {
					$el[0].contentWindow.postMessage(msg,'*');
				}

				// Wait for meteor to startup
				$scope.$on('mframe.startup', function() {
					// Then start watching the $meteor queue
					$scope.$watch(function() {
						return $meteor.queue.length;
					}, function(qlen) {
						console.log('current queue', qlen, $meteor.queue);
						if(qlen) {
							$meteor.queue.splice(0,qlen).forEach(postMessage);
						}
					});
				});
			}
		}
	}
]);