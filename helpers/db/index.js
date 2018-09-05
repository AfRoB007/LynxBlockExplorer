var coinStats = require('./coin-stats');
var tx = require('./tx');
var block = require('./block');
var peers = require('./peers');
var richlist = require('./rich-list');
var markets = require('./markets');
var address = require('./address');
var heavy = require('./heavy');
var ipDetails = require('./ip-details');

exports.db = {
    tx,
    block,
    peers,
    richlist,
    coinStats,
    markets,
    address,
    heavy,
    ipDetails
};