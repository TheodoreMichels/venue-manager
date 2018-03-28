var path = require('path');
var fs = require('fs');
var mongoose = require('mongoose');
var Busboy = require('busboy');

var schemas = require('../models/venue.js');

var express = require('express');
var router = express.Router();

var Venues = mongoose.model('Venue', schemas.VenueSchema);

var allFiles = {};

var venueDirectory;

function readVideoDirectory(directory){
    allFiles = fs.readdirSync(path.join('./videos/', directory));
}

function generateVenuePage(req, res) {
    venueDirectory = req.params.directory;
    
    Venues.findOne({ 'directory': venueDirectory }, function(err, venue) {
        if (err) return handleError(err);
        
        var targetDirectory = path.join('./videos/', venueDirectory);
        
        if(!fs.existsSync(targetDirectory)){
            fs.mkdirSync(targetDirectory);
        }
        
        readVideoDirectory(venueDirectory);
        
        res.render('venue-single', { title: venue.name, directory: venueDirectory, files: allFiles });
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('venues');
});

router.get('/:directory', function(req, res, next) {
    generateVenuePage(req, res);
});

router.get('/:directory/videos', function(req, res, next){
    readVideoDirectory(req.params.directory);
    res.json(allFiles);
});

router.post('/:directory/delete/:file', function(req, res, next){
    console.log('Deleting ' + req.params.file);
    fs.unlink('./videos/'+req.params.directory+'/'+req.params.file, function(){
        console.log('Finished deleting ' + req.params.file);
    });
    generateVenuePage(req, res);
});

router.post('/:directory/upload', function(req, res, next) {
    console.log('Sending data from ' + req.params.directory);
    
    var busboy = new Busboy({ headers: req.headers });
    
    var saveTo, targetDirectory, fileName;
    
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        targetDirectory = path.join('./videos/', req.params.directory);
        fileName = filename;
        
        if(!fs.existsSync(targetDirectory)){
            console.log(req.params.directory + ' directory does not exist. Creating...');
            fs.mkdirSync(targetDirectory);
            console.log('Created directory ' + req.params.directory);
        }
        
        saveTo = path.join(targetDirectory, '/temp-download');
        console.log('Uploading: ' + saveTo);
        file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
        console.log('Upload complete');
        fs.renameSync(saveTo, path.join(targetDirectory, '/' + fileName))
        generateVenuePage(req, res);
    });
    
    return req.pipe(busboy);
});

module.exports = router;