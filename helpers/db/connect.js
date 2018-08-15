var mongoose = require('mongoose');
var isPi = require('detect-rpi');
var settings = require('../../lib/settings');

exports.connect = (cb) => {
    var dbString = 'mongodb://';
    if (settings.dbsettings.user && settings.dbsettings.password && !isPi()) {
        dbString += settings.dbsettings.user;
        dbString += ':' + settings.dbsettings.password + '@';
    }
    dbString += settings.dbsettings.address;
    dbString += ':' + settings.dbsettings.port;
    dbString += '/' + settings.dbsettings.database;
    dbString += '?authSource=' + settings.dbsettings.database + '&w=1';

    mongoose.connect(dbString, {
        useNewUrlParser: true
    }, function (err) {
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