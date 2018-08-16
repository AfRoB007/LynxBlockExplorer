var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IpDetails = new Schema({
    createdAt: {
        type: Date,
        expires: 86400,
        default: Date.now()
    },
    ip: String,
    type: String,
    continent_code: String,
    continent_name: String,
    country_code: String,
    country_name: String,
    region_code: String,
    region_name: String,
    city: String,
    zip: String,
    latitude: Number,
    longitude: Number,
    location: {
        geoname_id: Number,
        capital: String,
        languages: [
            {
                code : String,
                name : String,
                native : String
            }
        ],
        country_flag: String,
        country_flag_emoji: String,
        country_flag_emoji_unicode: String,
        calling_code: String,
        is_eu: Boolean
    }
});

module.exports = mongoose.model('ip_details', IpDetails);
