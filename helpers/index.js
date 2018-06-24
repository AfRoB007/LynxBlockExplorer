var bitcoin = require('./bitcoin');
var lib = require('./lib');
var coinStats = require('./db/coin-stats');
var tx = require('./db/tx');
var peers = require('./db/peers');
var richlist = require('./db/rich-list');
var markets = require('./db/markets');
var address = require('./db/address');

exports.lib = lib;
exports.bitcoin = bitcoin;
exports.db = {
    tx,
    peers,
    richlist,
    coinStats,
    markets,
    address
};