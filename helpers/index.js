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
      return cb();
    });

    mongoose.connection.on('connected', function () {  
      console.log('Successfully connected to MongoDB');
    }); 
    
    // If the connection throws an error
    mongoose.connection.on('error',function (err) {  
      console.log('MongoDB connection error: ' + err);
    }); 
    
    // When the connection is disconnected
    mongoose.connection.on('disconnected', function () {  
      console.log('MongoDB connection disconnected'); 
    });
    
    // If the Node process ends, close the Mongoose connection 
    process.on('SIGINT', function() {  
      mongoose.connection.close(function () { 
        console.log('Mongoose connection disconnected through app termination'); 
        process.exit(0); 
      }); 
    }); 
};