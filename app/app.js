(function () {
    'use strict';

    angular
        .module('app', ['ui.router','ngCookies'])
        .config(config)
        .run(run);

    function config($stateProvider, $urlRouterProvider) {
        // default route
        //window.alert("app.config");
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'home/index.html',
                controller: 'Home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'home' }
            })
            .state('account', {
                url: '/account',
                templateUrl: 'account/index.html',
                controller: 'Account.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'account' }
            })
            .state('paymentmethod',{
                url: '/paymentmethod',
                templateUrl: 'paymentmethod/index.html',
                controller: 'Paymentmethod.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'paymentmethod' }
            })
            .state('myasset', {
                url:'/assets',
                templateUrl:'assets/index.html',
                controller: 'Addassets.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'myasset'}
            });
    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        //window.alert("app.run");
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //window.alert("event---"+ JSON.stringify(event.name));
            //window.alert("toState---" + JSON.stringify(toState));
            //window.alert("toParams---" + JSON.stringify(toParams));
            //window.alert("fromState---" + JSON.stringify(fromState));
            //window.alert("fromParams---" + JSON.stringify(fromParams));
            $rootScope.activeTab = toState.data.activeTab;
        });
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        //window.alert("app.JWT token from server");
        $.get('/app/token', function (token) {
            window.jwtToken = token;
            angular.bootstrap(document, ['app']);
        });
    });
})();