(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    //window.alert("user.service.js");

    function Service($http, $q) {
        //window.alert("user.service.js --- Service($http, $q)");
        var service = {};

        service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
        service.AddPayment = AddPayment;
        service.AddAsset = AddAsset;
        service.GetAssetsDetails = GetAssetsDetails;
        service.PostAsset = PostAsset;
        service.UnpostAsset = UnpostAsset;

        return service;

        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            window.alert("user.service --- " + JSON.stringify(user));
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }

        function AddPayment(paymentinfo) {
            window.alert("user.service --- " + paymentinfo)
            return $http.put('/api/users/addpayment', paymentinfo).then(handleSuccess, handleError);
        }

        function AddAsset(newasset) {
            return $http.put('/api/users/addasset', newasset).then(handleSuccess, handleError);
        }

        function GetAssetsDetails(assetidlist) {
            //var encoded = encodeURIComponent(assetidlist);
            window.alert("user.service --- " + assetidlist);
            return $http.put('/api/users/getassetsdetails', assetidlist).then(handleSuccess, handleError);
        }

        function PostAsset(postasset) {
            return $http.put('/api/users/postasset', postasset).then(handleSuccess, handleError);
        }

        function UnpostAsset(assetid) {
            return $http.put('/api/users/unpostasset', assetid).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
