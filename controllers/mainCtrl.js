var App = angular.module("hmisPortal");

App.controller("mainCtrl", function ($rootScope, $scope, $q, $http, $timeout) {
    $rootScope.data = {};
    $scope.portalItems = portalItems;    
});

App.run(function() {
    console.log('Main controller initialized.');
});
