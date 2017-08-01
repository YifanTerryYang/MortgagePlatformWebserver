﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var invokechain = require('services/invokechain');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.put('/addpayment', addPaymentMethod);
router.put('/addasset', addNewAsset);
router.put('/getassetsdetails', getAssetsDetails);
router.put('/postasset', postAsset);
router.put('/unpostasset', unpostAsset);
router.put('/:_id', updateUser);
router.delete('/:_id', deleteUser);

module.exports = router;

function authenticateUser(req, res) {
    //console.log('users.controller --- authenticateUser');
    userService.authenticate(req.body.username, req.body.password)
    //invokechain.login()
        .then(function (result) {
            if (result) {
                // authentication successful
                console.log("users.controller --- result is " + result.payload);
                //console.log("token is " + result.token);
                var token = result.token;
                //res.send({ token: token });
                res.send(result);
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            console.log("err is " + err);
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function (result) {
            console.log("users.controller --- result:" + result);
            if(result.status && result.status === 200) {
                res.sendStatus(200);
            }else{
                res.status(400).send(result);
            }
        }).catch((err) => {
            console.log("users.controller --- err:" + err);
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                console.log("users.controller --- getCurrentUser:" + user);
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    console.log("users.controller.js --- updateUser");
    console.log("-----------------------------------------------------------------------------------")
    console.log(JSON.stringify(req.user));   // this is from request entity
    console.log(req.user.sub);    // this is from URL
    console.log(req.body);
    //toFile("./log.json", req.toString());
    console.log("-----------------------------------------------------------------------------------")
    var userId = req.user.sub;
    var userInfo = req.body;
    if (!userId) {
        return res.status(401).send('Account username empty');
    }
    console.log("userId:" + userId);
    userService.update(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addPaymentMethod(req, res) {
    var userId = req.user.sub;
    var userInfo = req.body;
    if (!userId) {
        return res.status(401).send('Account username empty');
    }
    console.log("userId:" + userId);
    userService.addpaymentmethod(userId, req.body)
        .then(function (result) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function addNewAsset(req, res) {
    var userId = req.user.sub;
    var assetinfo = req.body;
    if (!userId) {
        return res.status(401).send('Asset username empty');
    }
    userService.addnewasset(userId, assetinfo)
    .then(function(result){
        if (result && result.status === 200){
            res.sendStatus(200);
        }
        res.status(401).send('Asset exists already')

    })
    .catch(function (err) {
        //console.log("users.controller.js --- addNewAsset " + err);
            res.status(400).send(err);
    });
}

function getAssetsDetails(req, res) {
    var userId = req.user.sub;
    var assetidlist = req.body;
    console.log("users.controller.js --- getAssetsDetails" + req.body);
    if(!userId) {
        return res.status(401).send('Asset username empty');
    }
    userService.getassetsdetails(userId, assetidlist)
    .then(function(result){
        if(result) {
            res.send(result);
        }else{
            res.status(401).send('Get Asset list fail')
        }
        
    })
    .catch(function (err) {
        console.log("users.controller.js --- getAssetsDetails " + err);
            res.status(400).send(err);
    });
}

function postAsset(req, res) {
    var userId = req.user.sub;
    var postasset = req.body;
    if(!userId) {
        return res.status(401).send('Asset username empty');
    }
    userService.postasset(userId, postasset)
    .then(function(result){
        if(result) {
            res.send(result);
        }else{
            res.status(401).send('Post Asset fail')
        }
    })
    .catch(function (err) {
        console.log("users.controller.js --- postAsset " + err);
            res.status(400).send(err);
    });
}

function unpostAsset(req, res) {
    var userId = req.user.sub;
    var unpostassetid = req.body;
    if(!userId) {
        return res.status(401).send('Asset username empty');
    }
    userService.unpostasset(userId, unpostassetid)
    .then(function(result) {
        if(result) {
            res.send(result);
        }else{
            res.status(401).send('Retract Asset fail')
        }
    })
    .catch(function (err) {
        console.log("users.controller.js --- postAsset " + err);
            res.status(400).send(err);
    });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function toFile(path, content){
    var fs = require('fs');
    fs.writeFile(path, content, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 
}