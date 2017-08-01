(function () {
    'use strict';

    angular
        .module('app')
        .controller('Paymentmethod.IndexController', Controller);

    function Controller($window, UserService, FlashService, $scope) {
        var vm = this;
        vm.saveAcc = saveAcc;
        vm.refresh = refresh;

        initController($scope);

        function initController($scope) {
            //window.alert("home.controller ---");
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                $scope.items = getPaymentList(user.paymentmethodlist);
            });
            //$scope.items = [
            //    {name:'yang'},
            //    {name:'yifan'},
            //    {name:'Terry'}
            //]
        }

        function saveAcc() {
            if (vm.newacc && vm.newacc.accnumber) {
                UserService.AddPayment(vm.newacc)
                    .then(function () {
                        FlashService.Success('Payment info added');
                        
                    })
                    .catch(function (error) {
                        FlashService.Error(error);
                    });
            }
        }

        function refresh() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                $scope.items = getPaymentList(user.paymentmethodlist);
                window.alert($scope.items.length);
            });
        }
    }

    function getPaymentList(obj) {
        if (!obj) return;
        var result = [];
        for (var prop in obj) {  
            if (obj.hasOwnProperty(prop)) {   
            // or if (Object.prototype.hasOwnProperty.call(obj,prop)) for safety...  
                //alert("prop: " + prop + " value: " + obj[prop]);
                result.push(obj[prop]);
            }  
        }
        return result;
    }

})();