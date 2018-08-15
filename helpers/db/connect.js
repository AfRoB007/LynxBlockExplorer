var mongoose = require('mongoose');
var isPi = require('detect-rpi');
var npm = require('npmi');
var path = require('path');
var settings = require('../../lib/settings');

const connect = (cb) => {
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

const downgradeMongoose = (cb) => {
    if (isPi()) {
        console.log('Downgrading mongodb driver in Raspberry Pi. Please wait ...');
        var options = {
            name: 'mongoose',
            version: '4.1.0',
            path: '.',
            forceInstall: false,
            npmLoad: {
                loglevel: 'silent'
            }
        };
        npm(options, function (err, result) {
            if (err) {
                if(err.code === npmi.LOAD_ERR){
                    console.log('npm load error');
                }
                else if (err.code === npmi.INSTALL_ERR){
                    console.log('npm install error');
                }
                return console.log(err.message);
            }        
            // installed
            console.log('downgrade success');
            console.log(options.name+'@'+options.version+' installed successfully in '+path.resolve(options.path));
            cb();
        });
    }else{
        cb();
    }
};

exports.connect = (cb)=>{
    downgradeMongoose(function(){        
        connect(cb)
    });
};
exports.disconnect = () => {
    mongoose.disconnect();
};