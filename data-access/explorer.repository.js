var co = require('co');
var { bitcoin, db } = require('../helpers');

exports.getSummary = ()=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let data = {
                ... yield bitcoin.getDifficulty(),
                hashrate : yield bitcoin.getHashRate(),
                connections : yield bitcoin.getConnections(),
                blockcount : yield bitcoin.getBlockCount(),
                stats : yield db.coinStats.getCoinStats()
            };
            let { supply, last_price : lastPrice   } = data.stats;
            delete data.stats;
            data.supply = supply;
            data.lastPrice = lastPrice;
            resolve(data);
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getLastTransactions = (min,pageIndex,pageSize)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let grid = {
                data : yield db.tx.getLastTransactions(min, pageIndex, pageSize),
                count : yield db.tx.getLastTransactionsCount(min),
                pageIndex,
                pageSize
            };
            resolve(grid);
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getPeerConnections = (pageIndex,pageSize)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let grid = {
                data : yield db.peers.getPeers(pageIndex, pageSize),
                count : yield db.peers.getPeersCount(),
                pageIndex,
                pageSize
            };
            resolve(grid);
        }).catch(err=>{
            reject(err);
        });
    });    
};