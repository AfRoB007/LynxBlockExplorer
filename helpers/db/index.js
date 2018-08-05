var coinStats = require('./coin-stats');
var tx = require('./tx');
var peers = require('./peers');
var richlist = require('./rich-list');
var markets = require('./markets');
var address = require('./address');
var heavy = require('./heavy');

exports.db = {
    tx,
    peers,
    richlist,
    coinStats,
    markets,
    address,
    heavy
};