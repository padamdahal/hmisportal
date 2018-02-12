var App = angular.module('hmisPortal', ["ngRoute",'ngResource','ngAnimate',"datatables",'ngSanitize','ui.materialize']);

App.config(function($routeProvider){
	var defaultView = 'views/dashboard.html';
	var defaultController = 'dashboardCtrl';

  $routeProvider.when("/home",{
    templateUrl: defaultView,
    controller: defaultController
  });

  $routeProvider.otherwise({
		redirectTo: '/home'
  });
});

App.run( function($rootScope, $location) {
	console.log('App initialized.');

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
		Pace.restart()
	});
});
