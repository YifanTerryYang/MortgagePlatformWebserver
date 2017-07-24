(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller(UserService) {
        var vm = this;

        vm.user = "yangyifan";

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                console.log("index.controller:" + user);
                vm.user = user;
            });
        }
    }

})();