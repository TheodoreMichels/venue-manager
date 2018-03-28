var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var VenueSchema = new Schema({
    name: String,
    directory: String,
    address: String,
    contact: {
        first: String,
        last: String,
        email: String,
        phone: String
    }
});

module.exports = mongoose.model('Venue', VenueSchema);