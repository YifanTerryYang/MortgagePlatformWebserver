var express = require('express');
var router = express.Router();

// use session auth to secure the angular app files
router.use('/', function (req, res, next) {    // request will be intercepted
    console.log("token is " + req.session.token)
    if (req.path !== '/login' && !req.session.token) {
        console.log('/login?returnUrl=' + encodeURIComponent('/app' + req.path));
        return res.redirect('/login?returnUrl=' + encodeURIComponent('/app' + req.path));
    }
    //console.log("request is " + req.header);
    console.log("next----------");
    next();
});

// make JWT token available to angular app
router.get('/token', function (req, res) {
    res.send(req.session.token);
});

// serve angular app files from the '/app' route
router.use('/', express.static('app'));

module.exports = router;