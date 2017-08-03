(function () {
    'use strict';

    angular
        .module('app')
        .controller('Forms.IndexController', Controller);

    function Controller(UserService) {
        var vm = this;

        initController();

        function initController() {
            //window.alert("home.controller ---");
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
    }

})();