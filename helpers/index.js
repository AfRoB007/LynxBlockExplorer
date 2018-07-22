var mongoose = require('mongoose');
var bitcoin = require('./bitcoin');
var cryptoCompare = require('./cryptoCompare');
var lib = require('./lib');
var coinStats = require('./db/coin-stats');
var tx = require('./db/tx');
var peers = require('./db/peers');
var richlist = require('./db/rich-list');
var markets = require('./db/markets');
var address = require('./db/address');
var heavy = require('./db/heavy');
var settings = require('../lib/settings');

exports.lib = lib;
exports.bitcoin = bitcoin;
exports.cryptoCompare = cryptoCompare;
exports.db = {
  tx,
  peers,
  richlist,
  coinStats,
  markets,
  address,
  heavy
};

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