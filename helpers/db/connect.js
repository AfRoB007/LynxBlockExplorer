var mongoose = require('mongoose');
var isPi = require('detect-rpi');
var settings = require('../../lib/settings');

exports.connect = (cb) => {
    var dbString = 'mongodb://';
    var options = {
        useNewUrlParser : true
    };
    if (settings.dbsettings.user && settings.dbsettings.password && !isPi()) {
        dbString += settings.dbsettings.user;
        dbString += ':' + settings.dbsettings.password + '@';

        options = {
            useNewUrlParser : true,
            keepAlive: 1, 
            connectTimeoutMS: 30000, 
            reconnectTries: 30, 
            reconnectInterval: 5000
        };
    }
    dbString += settings.dbsettings.address;
    dbString += ':' + settings.dbsettings.port;
    dbString += '/' + settings.dbsettings.database;
    dbString += '?authSource=' + settings.dbsettings.database + '&w=1';

    mongoose.connect(dbString, options, function (err) {
        if (err) {
            console.log('Unable to connect to database: %s', dbString);
            console.log(err);
            process.exit(1);
        }
        console.log('Successfully connected to MongoDB');
        return cb();
    });
};

exports.disconnect = () => {
    mongoose.disconnect();
};