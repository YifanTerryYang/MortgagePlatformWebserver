var hfc = require('fabric-client');
var path = require('path');
var util = require('util');

var options = {
    wallet_path: path.join(__dirname, './network/creds'),
    user_id: 'PeerAdmin',
    channel_id: 'mychannel',
    chaincode_id: 'mortgage',   // fabcar
    peer_url: 'grpc://localhost:7051',
    event_url: 'grpc://localhost:7053',
    orderer_url: 'grpc://localhost:7050'
};


var channel = {};
var client = null;
var targets = [];
var tx_id = null;

function init(){
    client = new hfc();
    hfc.newDefaultKeyValueStore({ path: options.wallet_path })
    .then((wallet) => {
        console.log("wallet is " + wallet);
        console.log("Set wallet path, and associate user ", options.user_id, " with application");
        client.setStateStore(wallet);
        return client.getUserContext(options.user_id, true);
    }).then((user) => {
        console.log("Check user is enrolled, and set a query URL in the network");
        if (user === undefined || user.isEnrolled() === false) {
            console.error("User not defined, or not enrolled - error");
        }
        channel = client.newChannel(options.channel_id);
        var peerObj = client.newPeer(options.peer_url);
        channel.addPeer(peerObj);
        channel.addOrderer(client.newOrderer(options.orderer_url));
        targets.push(peerObj);
        return;
    });
}

function hello(){
    console.log("hello world");
}

function login(username, password){
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'login',
        args: [username, password],
        chainId: options.channel_id,
        txId: tx_id
    };
    var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return ss
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
            return proposalResponses[0].response;
        } else {
            console.error('transaction proposal was bad');
            return;
        }
    });

}

function createNewUser(userParm){
        tx_id = client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);
        // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
        // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
        // send proposal to endorser
        //console.log("userParm.firstName: " + userParm.firstName);
        //console.log("userParm.lastName: " + userParm.lastName);
        //console.log("userParm.username: " + userParm.username);
        //console.log("userParm.password: " + userParm.password);
        var userinfo = '{"fname":"' + userParm.firstName + '","lname":"' + userParm.lastName + '"}';
        //console.log("userinfo:" + userinfo);
        var username = userParm.username;
        var password = userParm.password;
        //console.log("firstName:" + userParm.firstName);
        //console.log("lastName:" + userParm.lastName);
        var request = {
            targets: targets,
            chaincodeId: options.chaincode_id,
            fcn: 'createnewuser',
            args: [username, password,userinfo],
            chainId: options.channel_id,
            txId: tx_id
        };
        var ss = channel.sendTransactionProposal(request);
        return ss
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
        } else {
            console.log('transaction proposal was bad');
        }

        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];
            let eh = client.newEventHub();
            eh.setPeerAddr(options.event_url);
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        console.error(
                            'The transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        console.log(
                            'The transaction has been committed on peer ' +
                            eh._ep._endpoint.addr);
                        resolve();
                    }
                });
            });
            eventPromises.push(txPromise);
            channel.sendTransaction(request);
            return proposalResponses[0].response;
        } else {
            return proposalResponses[0].response;
        }

    })
    .catch(err => {
        console.log("invokechain.js --- ERR HAPPEN;" + err);

    });
}

function getUserInfo(userid) {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'getuserinfo',
        args: [userid],
        chainId: options.channel_id,
        txId: tx_id
    };
    var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return ss
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
            return proposalResponses[0].response;
        } else {
            console.error('transaction proposal was bad');
            return;
        }
    });
}

function updateUserInfo(userid, userinfo) {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    userinfoJSON = JSON.stringify(userinfo);
    //console.log("invokechain.js --- " + userid);
    //console.log("invokechain.js --- " + userinfoJSON);
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'updateuser',
        args: [userid, userinfoJSON],
        chainId: options.channel_id,
        txId: tx_id
    };
    var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return ss
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
        } else {
            console.error('transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];
            let eh = client.newEventHub();
            eh.setPeerAddr(options.event_url);
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        console.error(
                            'The transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        console.log(
                            'The transaction has been committed on peer ' +
                            eh._ep._endpoint.addr);
                        resolve();
                    }
                });
            });
            eventPromises.push(txPromise);
            channel.sendTransaction(request);
            return proposalResponses[0].response;
        } else {
            return proposalResponses[0].response;
        }

    })
    .catch(err => {
        console.log("invokechain.js --- ERR HAPPEN;" + err);

    });
}

function addPaymentMethod(userid, paymentinfo) {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    paymentinfoJSON = JSON.stringify(paymentinfo);
    console.log("invokechain.js --- " + userid);
    console.log("invokechain.js --- " + paymentinfo.accnumber);
    console.log("invokechain.js --- " + paymentinfoJSON);
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'addpayment',
        args: [userid,paymentinfo.accnumber, paymentinfoJSON],
        chainId: options.channel_id,
        txId: tx_id
    };
    //var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return channel.sendTransactionProposal(request)
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
        } else {
            console.error('transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];
            let eh = client.newEventHub();
            eh.setPeerAddr(options.event_url);
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        console.error(
                            'The transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        console.log(
                            'The transaction has been committed on peer ' +
                            eh._ep._endpoint.addr);
                        resolve();
                    }
                });
            });
            eventPromises.push(txPromise);
            channel.sendTransaction(request);
            return proposalResponses[0].response;
        } else {
            return proposalResponses[0].response;
        }

    })
    .catch(err => {
        console.log("invokechain.js --- ERR HAPPEN;" + err);

    });
}

function addAsset(userid, assetinfo) {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    assetinfoJSON = JSON.stringify(assetinfo);
    console.log("invokechain.js --- " + userid);
    console.log("invokechain.js --- " + assetinfo.key);
    console.log("invokechain.js --- " + assetinfoJSON);
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'addasset',
        args: [userid,assetinfo.key, assetinfoJSON],
        chainId: options.channel_id,
        txId: tx_id
    };
    //var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return channel.sendTransactionProposal(request)
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
        } else {
            console.error('transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];
            let eh = client.newEventHub();
            eh.setPeerAddr(options.event_url);
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        console.error(
                            'The transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        console.log(
                            'The transaction has been committed on peer ' +
                            eh._ep._endpoint.addr);
                        resolve();
                    }
                });
            });
            eventPromises.push(txPromise);
            channel.sendTransaction(request);
            return proposalResponses[0].response;
        } else {
            return proposalResponses[0].response;
        }

    })
    .catch(err => {
        console.log("invokechain.js --- ERR HAPPEN;" + err);

    });
}

function getAssetsDetails(userid, assetsIdList) {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    console.log("invokechain: " + assetsIdList);
    var _args = [];
    for(var i=0; i<assetsIdList.length; i++){
        _args.push(assetsIdList[i]);
    }
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'getassetinfo',
        args: _args,
        chainId: options.channel_id,
        txId: tx_id
    };
    var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return ss
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
            return proposalResponses[0].response;
        } else {
            console.error('transaction proposal was bad');
            return;
        }
    });
}

function postAsset(userid, postasset) {
    tx_id = client.newTransactionID();
    console.log("Assigning transaction_id: ", tx_id._transaction_id);
    // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
    // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
    // send proposal to endorser
    postassetJSON = JSON.stringify(postasset);
    console.log("invokechain.js --- " + userid);
    console.log("invokechain.js --- " + postassetJSON);
    var request = {
        targets: targets,
        chaincodeId: options.chaincode_id,
        fcn: 'postasset',
        args: [userid,postasset.key,postasset.interestrate,postasset.worth,postasset.period],
        chainId: options.channel_id,
        txId: tx_id
    };
    //var ss = channel.sendTransactionProposal(request);
    //console.log("invokechain.login, channel.sendTransactionProposal " + ss);
    return channel.sendTransactionProposal(request)
    .then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        //console.log(proposalResponses);
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",proposal));
        //console.log("-------------------------------------------------------");
        //console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
        } else {
            console.error('transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];
            let eh = client.newEventHub();
            eh.setPeerAddr(options.event_url);
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        console.error(
                            'The transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        console.log(
                            'The transaction has been committed on peer ' +
                            eh._ep._endpoint.addr);
                        resolve();
                    }
                });
            });
            eventPromises.push(txPromise);
            channel.sendTransaction(request);
            return proposalResponses[0].response;
        } else {
            return proposalResponses[0].response;
        }

    })
    .catch(err => {
        console.log("invokechain.js --- ERR HAPPEN;" + err);

    });
}

function unpostAsset(userid, postasset) {
    
}

function body(){
    Promise.resolve().then(() => {
    console.log("Create a client and set the wallet location");
    client = new hfc();
    return hfc.newDefaultKeyValueStore({ path: options.wallet_path });
    }).then((wallet) => {
        console.log("wallet is " + wallet);
        console.log("Set wallet path, and associate user ", options.user_id, " with application");
        client.setStateStore(wallet);
        return client.getUserContext(options.user_id, true);
    }).then((user) => {
        console.log("Check user is enrolled, and set a query URL in the network");
        if (user === undefined || user.isEnrolled() === false) {
            console.error("User not defined, or not enrolled - error");
        }
        channel = client.newChannel(options.channel_id);
        var peerObj = client.newPeer(options.peer_url);
        channel.addPeer(peerObj);
        channel.addOrderer(client.newOrderer(options.orderer_url));
        targets.push(peerObj);
        return;
    }).then(() => {
        tx_id = client.newTransactionID();
        console.log("Assigning transaction_id: ", tx_id._transaction_id);
        // createCar - requires 5 args, ex: args: ['CAR11', 'Honda', 'Accord', 'Black', 'Tom'],
        // changeCarOwner - requires 2 args , ex: args: ['CAR10', 'Barry'],
        // send proposal to endorser
        var request = {
            targets: targets,
            chaincodeId: options.chaincode_id,
            fcn: 'hw',
            args: ["terry@yang.com", "5331887545685964","{\"Paymenttype\":\"Credit card\", \"addr\":{\"addr1\":\"123 Corporate\",\"addr2\":\"apt.1815\", \"city\":\"Jax\"}}"],
            chainId: options.channel_id,
            txId: tx_id
        };
        return channel.sendTransactionProposal(request);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var header = results[2];
        console.log(proposalResponses);
        console.log("-------------------------------------------------------");
        console.log(util.format("%s",proposal));
        console.log("-------------------------------------------------------");
        console.log(util.format("%s",header));
        let isProposalGood = false;
        if (proposalResponses && proposalResponses[0].response &&
            proposalResponses[0].response.status === 200) {
            isProposalGood = true;
            console.log('transaction proposal was good');
        } else {
            console.error('transaction proposal was bad');
        }
        if (isProposalGood) {
            console.log(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal,
                header: header
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];
            let eh = client.newEventHub();
            eh.setPeerAddr(options.event_url);
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(transactionID, (tx, code) => {
                    clearTimeout(handle);
                    eh.unregisterTxEvent(transactionID);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        console.error(
                            'The transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        console.log(
                            'The transaction has been committed on peer ' +
                            eh._ep._endpoint.addr);
                        resolve();
                    }
                });
            });
            eventPromises.push(txPromise);
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                console.log(' event promise all complete and testing complete');
                return results[0]; // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
            }).catch((err) => {
                console.error(
                    'Failed to send transaction and get notifications within the timeout period.'
                );
                return 'Failed to send transaction and get notifications within the timeout period.';
            });
        } else {
            console.error(
                'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        console.error('Failed to send proposal due to error: ' + err.stack ? err.stack :
            err);
        return 'Failed to send proposal due to error: ' + err.stack ? err.stack :
            err;
    }).then((response) => {
        if (response.status === 'SUCCESS') {
            console.log('Successfully sent transaction to the orderer.');
            console.log("tx_id:" + tx_id.getTransactionID());
            return tx_id.getTransactionID();
        } else {
            console.error('Failed to order the transaction. Error code: ' + response.status);
            return 'Failed to order the transaction. Error code: ' + response.status;
        }
    }, (err) => {
        console.error('Failed to send transaction due to error: ' + err.stack ? err
            .stack : err);
        return 'Failed to send transaction due to error: ' + err.stack ? err.stack :
            err;
    });
}




module.exports = {
    hello,
    login,
    createNewUser,
    init,
    getUserInfo,
    updateUserInfo,
    addPaymentMethod,
    addAsset,
    postAsset,
    getAssetsDetails,
    unpostAsset,
    body
}