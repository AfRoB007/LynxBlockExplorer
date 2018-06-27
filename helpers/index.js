var mongoose = require('mongoose');
var bitcoin = require('./bitcoin');
var lib = require('./lib');
var coinStats = require('./db/coin-stats');
var tx = require('./db/tx');
var peers = require('./db/peers');
var richlist = require('./db/rich-list');
var markets = require('./db/markets');
var address = require('./db/address');
var heavy = require('./db/heavy');

exports.lib = lib;
exports.bitcoin = bitcoin;
exports.db = {
    tx,
    peers,
    richlist,
    coinStats,
    markets,
    address,
    heavy
};

exports.connect = (database, cb)=> {
    mongoose.connect(database, function(err) {
      if (err) {
        console.log('Unable to connect to database: %s', database);
        console.log('Aborting');
        process.exit(1);
      }
      console.log('Successfully connected to MongoDB');
      return cb();
    });
};