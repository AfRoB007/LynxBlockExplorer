var Markets = require('../../models/markets');

exports.getMarkets = (market)=>{
    return Markets.findOne({ market });
};

exports.isAlreadyExist = (market) => {
    return new Promise((resolve, reject) => {
        Markets.findOne({
            market
        }, function (err, item) {
            if (err) {
                reject(err);
            } else {
                resolve(item !== null);
            }
        });
    });
};

exports.update = (market, model)=>{
    return new Promise((resolve,reject)=>{
        Markets.update({ market }, model, function(err,data) {
            if(err) reject(err);
            else resolve(data);
        });
    });
};