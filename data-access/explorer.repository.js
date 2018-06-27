var co = require('co');
var { bitcoin, db } = require('../helpers');

exports.getSummary = ()=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
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

exports.getPeerConnections = (min)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            resolve(yield db.peers.getPeers());
        }).catch(err=>{
            reject(err);
        });
    });    
};