var mongoose = require('mongoose');
var bitcoin = require('./bitcoin');
var { db } = require('./db/index');
var cryptoCompare = require('./cryptoCompare');
var lib = require('./lib');

var settings = require('../lib/settings');

exports.lib = lib;
exports.bitcoin = bitcoin;
exports.cryptoCompare = cryptoCompare;
exports.db = db;

exports.connect = (cb) => {
  var dbString = 'mongodb://';
  if (settings.dbsettings.user && settings.dbsettings.password) {
    dbString = dbString + settings.dbsettings.user;
    dbString = dbString + ':' + settings.dbsettings.password;
  }
  dbString = dbString + '@' + settings.dbsettings.address;
  dbString = dbString + ':' + settings.dbsettings.port;
  dbString = dbString + '/' + settings.dbsettings.database;

  mongoose.connect(dbString, function (err) {
    if (err) {
      console.log('Unable to connect to database: %s', dbString);      
      process.exit(1);
    }
    console.log('Successfully connected to MongoDB');
    return cb();
  });
};

exports.disconnect = ()=>{
  mongoose.disconnect();
};