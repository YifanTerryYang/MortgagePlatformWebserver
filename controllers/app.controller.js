var express = require('express');
var router = express.Router();

// use session auth to secure the angular app files
router.use('/', function (req, res, next) {    // request will be intercepted
    //console.log("token is " + req.session.token)
    if (req.path !== '/login' && !req.session.token) {
        console.log('/login?returnUrl=' + encodeURIComponent('/app' + req.path));
        return res.redirect('/login?returnUrl=' + encodeURIComponent('/app' + req.path));
    }
    var entity = decodeURIComponent(req.session.yang);
    console.log("app.controller-----" + entity);
   
    next();
});

// make JWT token available to angular app
router.get('/token', function (req, res) {
    console.log("app.controller.js ---- /token");
    res.send(req.session.token);
});

// serve angular app files from the '/app' route
router.use('/', express.static('app'));
//router.use('/', function (req, res){
//    console.log("mark");
//    console.log("\n");
//    return res.render('index', {error:"no err", success:"success"});
//});

module.exports = router;