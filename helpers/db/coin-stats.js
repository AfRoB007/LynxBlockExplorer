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

exports.update = (model)=>{
    return new Promise((resolve,reject)=>{
        CoinStats.update({coin: coin}, model, function(err,stat) {
            if(err) reject(err);
            else resolve(stat);
        });
    });
};

exports.save = (model) => {
    return new Promise((resolve, reject) => {
        var stats = new CoinStats(model);
        stats.save(function (err) {
            if (err) reject(err);
            else resolve(stats);
        });
    });
};
