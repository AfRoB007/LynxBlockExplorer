var CoinStats = require('../../models/stats');
var { coin } = require('../../lib/settings');

exports.getCoinStats = ()=>{
    return CoinStats.findOne({ coin });
};