var mongoose = require('mongoose');

var schemas = require('../models/venue.js');

var express = require('express');
var router = express.Router();

console.log("Hello, Dave. You're looking well today.");

var Venues = mongoose.model('Venue', schemas.VenueSchema);

var allVenues = {};

function loadVenues(res){
    Venues.find(function(err, venues){
        allVenues = venues;
        
        res.render('index', { title: 'Home', venues: allVenues });
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    loadVenues(res);
});

router.post('/', function(req, res, next){
    Venues.findByIdAndRemove(req.body.id, function(err){
        if(err) return handleError(err);
        console.log('Deleted ' + req.body.id);
        
        loadVenues(res);
    });
    
});

module.exports = router;
