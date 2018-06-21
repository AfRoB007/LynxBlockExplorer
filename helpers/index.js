var bitcoin = require('./bitcoin');
var coinStats = require('./db/coin-stats');

exports.bitcoin = bitcoin;
exports.db = {
    coinStats
};