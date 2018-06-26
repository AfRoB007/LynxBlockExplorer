var CoinStats = require('../../models/stats');
var { coin } = require('../../lib/settings');

exports.getCoinStats = ()=>{
    return new Promise((resolve,reject)=>{
        CoinStats.findOne({ coin }, (err,stat)=>{
            if(err) reject(err);
            else resolve(stat);
        });
    });
};