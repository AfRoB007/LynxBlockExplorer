var co = require('co');
var { bitcoin, db } = require('../helpers');

exports.getSummary = ()=>{
    return new Promise((resolve,reject)=>{
        co(function* getSummary(){
            let difficulty  = bitcoin.getDifficulty();
            let hashrate = bitcoin.getHashRate();
            let connections = bitcoin.getConnections();
            let blockcount = bitcoin.getBlockCount();
            let stats = db.coinStats.getCoinStats();
            
            yield [difficulty,hashrate,connections,blockcount,stats];            
            let { supply, last_price : lastPrice   } = stats;

            resolve({                
                ...difficulty,
                supply,
                hashrate,
                lastPrice,
                connections,
                blockcount
            });
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getLastTransactions = (min)=>{
    return new Promise((resolve,reject)=>{
        co(function* getLastTransactions(){
            resolve(yield db.tx.getLastTransactions(min));
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getPeerConnections = (min)=>{
    return new Promise((resolve,reject)=>{
        co(function* getPeerConnections(){
            resolve(yield db.peers.getPeers());
        }).catch(err=>{
            reject(err);
        });
    });    
};