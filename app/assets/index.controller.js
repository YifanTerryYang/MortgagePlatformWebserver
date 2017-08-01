(function () {
    'use strict';

    angular
        .module('app')
        .controller('Addassets.IndexController', Controller);

    function Controller($window, UserService, FlashService, $scope) {
        var vm = this;
        vm.saveAsset = saveAsset;
        vm.refresh = refresh;
        vm.postAsset = postAsset;
        vm.unpostAsset = unpostAsset;

        initController($scope);

        function initController($scope) {
            //window.alert("home.controller ---");
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                //window.alert(JSON.stringify(user.assetlist));
                var templist = user.assetlist.split("|");
                var assetlist = [];
                for (var i=0; i<templist.length; i++){
                    if(templist[i] != ""){
                        //window.alert(JSON.stringify(templist[i]));
                        assetlist.push(templist[i]);
                    }
                    
                }
                UserService.GetAssetsDetails(assetlist)
                .then(function (result){
                    //window.alert("assets list: " + result.length);

                    $scope.items = getAssetsList(result);
                });
                
            });
        }

        function saveAsset() {
            if (vm.newasset && vm.newasset.key && vm.newasset.desc) {
                UserService.AddAsset(vm.newasset)
                    .then(function () {
                        FlashService.Success('Asset added');
                    })
                    .catch(function (error) {
                        FlashService.Error(error);
                    });
            }
        }

        function refresh() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;

                //window.alert(JSON.stringify(user.assetlist));
                var templist = user.assetlist.split("|");
                var assetlist = [];
                for (var i=0; i<templist.length; i++){
                    if(templist[i] != ""){
                        //window.alert(JSON.stringify(templist[i]));
                        assetlist.push(templist[i]);
                    }
                    
                }
                UserService.GetAssetsDetails(assetlist)
                .then(function (result){
                    //window.alert("assets list: " + result.length);
                    $scope.items = getAssetsList(result);
                });
                
            });
        }

        function postAsset() {
            //window.alert(parseInt("123"));
            if(vm.postasset && vm.postasset.key && vm.postasset.worth
                && vm.postasset.interestrate && vm.postasset.period) {
                    var worth = parseFloat(vm.postasset.worth);
                    var interrate = parseFloat(vm.postasset.interestrate);
                    var period = parseFloat(vm.postasset.period);
                    if(!worth || worth < 0) { window.alert("Price should be larger than 0"); }
                    else if(!interrate || interrate < 0) { window.alert("You don't want to pay the man who bought your house. Do you?"); }
                    else if(period < 0 || period > 100 || !Number.isInteger(period)){
                        window.alert("Repayment Period: Please input an integer, less than 100, larger than 0");
                    }else{
                        var asset = {};
                        asset.key = vm.postasset.key;
                        asset.worth = worth;
                        asset.interrate = interrate;
                        asset.period = period;

                        UserService.PostAsset(vm.postasset)
                        .then(function () {
                            FlashService.Success('Asset posted');
                        })
                        .catch(function (error) {
                            FlashService.Error(error);
                        });
                    }
            }
        }

        function unpostAsset() {
            //if(vm.unpostasset && vm.unpostasset.key) {
            //    UserService.UnpostAsset(vm.unpostasset)
            //    .then(function () {
            //        FlashService.Success('Asset Retracted');
            //    })
            //    .catch(function (error) {
            //        FlashService.Error(error);
            //    });
            //}
        }

        function getAssetsList(assetlist) {
            var result = [];
            for(var i=0; i<assetlist.length; i++) {
                var tmp = {};
                if(assetlist[i].worth !== 0) {
                    tmp.posted = "POSTED---"
                }else{
                    tmp.posted = ""
                }
                tmp.key = assetlist[i].key.split("\u0000")[2];
                tmp.desc = assetlist[i].desc;
                tmp.status = assetlist[i].status;
                tmp.worth = assetlist[i].worth;
                tmp.interestrate = assetlist[i].interestrate;
                tmp.period = assetlist[i].period;

                result.push(tmp);
            }
            return result;
        }
    }

    

})();