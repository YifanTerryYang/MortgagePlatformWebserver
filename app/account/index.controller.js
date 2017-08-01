(function () {
    'use strict';

    angular
        .module('app')
        .controller('Account.IndexController',Controller);//, ['$cookies','$window','UserService','FlashService', Controller]);

    function Controller($window, UserService, FlashService) {
        //window.alert("account.controller---Controller($window, UserService, FlashService");
        var vm = this;
        //window.alert("$cookies" + $cookies);
        //vm.user = {
        //    firstName: 'yifan',
        //    lastName: 'yang',
        //    username: 'test',
        //    password: 'aaaa'
        //};
        vm.user = null;
        vm.saveUser = saveUser;
        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function saveUser() {
            window.alert(vm.user.fname);
            UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

    }

})();