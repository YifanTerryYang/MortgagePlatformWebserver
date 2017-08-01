var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('users');
var invokechain = require('services/invokechain');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.addpaymentmethod = addpaymentmethod;
service.addnewasset = addnewasset;
service.getassetsdetails = getassetsdetails;
service.postasset = postasset;
service.unpostasset = unpostasset;

module.exports = service;

function authenticate(username, password) {
    //var deferred = Q.defer();

    //db.users.findOne({ username: username }, function (err, user) {
    //    if (err) deferred.reject(err.name + ': ' + err.message);
    //
    //    if (user && bcrypt.compareSync(password, user.hash)) {
    //        // authentication successful
    //        deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
    //    } else {
    //        // authentication failed
    //        deferred.resolve();
    //    }
    //});
    //console.log("user.service --- authenticate");
    return invokechain.login(username, password)
    .then((res) => {
        //console.log("user.service --- res " + res.status);
        if (res && res.status === 200){
            var t = jwt.sign({ sub: username }, config.secret);
            console.log("user.service ---  " + res.payload);
            var v = {token:t, payload: encodeURIComponent(res.payload), content:"fdasfds"};
            return v;
        }else{
            return res;
        }
        
    });
}

function getById(_id) {
    return invokechain.getUserInfo(_id)
    .then((res) => {
        if (res && res.status === 200){
            return res.payload;
        }else{
            return;
        }
    });
}

function create(userParam) {
    return invokechain.createNewUser(userParam);
}

function update(_id, userParam) {
    return invokechain.updateUserInfo(_id,userParam)
    .then((result) => {
        console.log("user.service.js --- " + JSON.stringify(result));
    });
}

function addpaymentmethod(_id, paymentinfo) {
    return invokechain.addPaymentMethod(_id,paymentinfo)
    .then((result) => {
        console.log("user.service.js --- " + JSON.stringify(result));
    });
}

function addnewasset(_id, assetinfo) {
    return invokechain.addAsset(_id, assetinfo);
    //.then((result) => {
    //    console.log("user.service.js --- " + JSON.stringify(result));
    //});
}

function getassetsdetails(_id, assetsidlist) {
    return invokechain.getAssetsDetails(_id, assetsidlist)
    .then((res) => {
        if (res && res.status === 200){
            console.log("user.service---getassetsdetails:" + res.payload);
            return res.payload;
        }else{
            return;
        }
    });
}

function postasset(_id, postasset) {
    return invokechain.postAsset(_id, postasset)
    .then((res) => {
        if (res && res.status === 200){
            console.log("user.service---postasset:" + res.payload);
            return res.payload;
        }else{
            return;
        }
    })
}

function unpostasset(_id, unpostassetid) {
    return invokechain.unpostAsset(_id, unpostassetid)
    .then((res) => {
        if (res && res.status === 200){
            console.log("user.service---postasset:" + res.payload);
            return res.payload;
        }else{
            return;
        }
    })
}

function _delete(_id) {
    var deferred = Q.defer();

    db.users.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}