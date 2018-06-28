var co = require('co');
var { db } = require('../helpers');

exports.getMarkets = (market)=>{
    return new Promise((resolve,reject)=>{
        co(function* getMarkets(){
            let markets = db.markets.getMarkets(market);
            resolve(yield markets);
        }).catch(err=>{
            reject(err);
        });
    });    
};