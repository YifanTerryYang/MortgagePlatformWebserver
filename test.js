require('rootpath')();
var jwt = require('jsonwebtoken');
var config = require('config.json');
var invokechain = require('services/invokechain');

console.log(config.secret);
var str = jwt.sign({ sub: 'yang' }, config.secret);
str = jwt.sign({ sub123: '' }, config.secret);

console.log(str);
var p = Promise.resolve([1,2,3]);
p.then((v) => {
    console.log(v);
    console.log(v.length);
    return v[0];
}).then((val) => {
    console.log("val is " + val);

})

var op = {a:'yang', b: 'yifan'};

console.log('err is ' + typeof(new Error("error body")));