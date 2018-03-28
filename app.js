var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var Busboy = require('busboy');

var schemas = require('./models/venue.js');


//   ______   _______ _________ _______  ______   _______  _______  _______ 
//  (  __  \ (  ___  )\__   __/(  ___  )(  ___ \ (  ___  )(  ____ \(  ____ \
//  | (  \  )| (   ) |   ) (   | (   ) || (   ) )| (   ) || (    \/| (    \/
//  | |   ) || (___) |   | |   | (___) || (__/ / | (___) || (_____ | (__    
//  | |   | ||  ___  |   | |   |  ___  ||  __ (  |  ___  |(_____  )|  __)   
//  | |   ) || (   ) |   | |   | (   ) || (  \ \ | (   ) |      ) || (      
//  | (__/  )| )   ( |   | |   | )   ( || )___) )| )   ( |/\____) || (____/\
//  (______/ |/     \|   )_(   |/     \||/ \___/ |/     \|\_______)(_______/
//                                                                          

var mongoose = require('mongoose');
var Venues = mongoose.model('Venue', schemas.VenueSchema);

var mongoDB = 'mongodb://localhost/venue_db';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;

var database = mongoose.connection;

database.on('error', console.error.bind(console, 'MongoDB connection error:'));


//   _______  _______          _________ _______  _______ 
//  (  ____ )(  ___  )|\     /|\__   __/(  ____ \(  ____ \
//  | (    )|| (   ) || )   ( |   ) (   | (    \/| (    \/
//  | (____)|| |   | || |   | |   | |   | (__    | (_____ 
//  |     __)| |   | || |   | |   | |   |  __)   (_____  )
//  | (\ (   | |   | || |   | |   | |   | (            ) |
//  | ) \ \__| (___) || (___) |   | |   | (____/\/\____) |
//  |/   \__/(_______)(_______)   )_(   (_______/\_______)
//                                                        

var index = require('./routes/index');
var venues = require('./routes/venues');

var app = express();

//   _______  _______  _______  _        _______ _________  _________ _______    _______           _______  _       _________ _______ 
//  (  ____ \(  ___  )(  ____ \| \    /\(  ____ \\__   __/  \__   __/(  ___  )  (  ____ \|\     /|(  ____ \( (    /|\__   __/(  ____ \
//  | (    \/| (   ) || (    \/|  \  / /| (    \/   ) (        ) (   | (   ) |  | (    \/| )   ( || (    \/|  \  ( |   ) (   | (    \/
//  | (_____ | |   | || |      |  (_/ / | (__       | |        | |   | |   | |  | (__    | |   | || (__    |   \ | |   | |   | (_____ 
//  (_____  )| |   | || |      |   _ (  |  __)      | |        | |   | |   | |  |  __)   ( (   ) )|  __)   | (\ \) |   | |   (_____  )
//        ) || |   | || |      |  ( \ \ | (         | |        | |   | |   | |  | (       \ \_/ / | (      | | \   |   | |         ) |
//  /\____) || (___) || (____/\|  /  \ \| (____/\   | |     ___) (___| (___) |  | (____/\  \   /  | (____/\| )  \  |   | |   /\____) |
//  \_______)(_______)(_______/|_/    \/(_______/   )_(     \_______/(_______)  (_______/   \_/   (_______/|/    )_)   )_(   \_______)
//                                                                                                                                    

var io = require('socket.io')();
app.io = io;

io.on('connection', function(socket){
  console.log('A user connected.');
  
  socket.on('create-venue', function(msg){
    console.log('Attempting to create a new venue.');
    
    Venues.create({
      name: msg.name,
      directory: msg.directory,
      address: msg.address,
      contact: msg.contact
    }, function(err, newVenue){
      if(err) return handleError(err);
      console.log('Successfully created new venue: ' + newVenue.name + ', ID: ' + newVenue._id);
      
    });
  });
  
  socket.on('disconnect', function(){
    console.log('A user disconnected');
  });
});


//   _______  _______ _________          _______ 
//  (  ____ \(  ____ \\__   __/|\     /|(  ____ )
//  | (    \/| (    \/   ) (   | )   ( || (    )|
//  | (_____ | (__       | |   | |   | || (____)|
//  (_____  )|  __)      | |   | |   | ||  _____)
//        ) || (         | |   | |   | || (      
//  /\____) || (____/\   | |   | (___) || )      
//  \_______)(_______/   )_(   (_______)|/       
//                                               

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/venues', venues);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
