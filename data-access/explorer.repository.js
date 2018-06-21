var co = require('co');
var { bitcoin, db } = require('../helpers');

exports.getSummary = ()=>{
    return new Promise((resolve,reject)=>{
        co(function* getSummary(){
            // let { difficulty, difficultyHybrid }  = yield bitcoin.getDifficulty();
            // let hashrate = yield bitcoin.getHashRate();
            // let connections = yield bitcoin.getConnections();
            // let blockcount = yield bitcoin.getBlockCount();
            // let { supply, last_price : lastPrice   } = yield db.coinStats.getCoinStats();
            
            // resolve({                
            //     difficulty,
            //     difficultyHybrid,
            //     supply,
            //     hashrate,
            //     lastPrice,
            //     connections,
            //     blockcount
            // });
            let difficulty  = bitcoin.getDifficulty();
            let hashrate = bitcoin.getHashRate();
            let connections = bitcoin.getConnections();
            let blockcount = bitcoin.getBlockCount();
            let stats = db.coinStats.getCoinStats();
            
            yield [difficulty,hashrate,connections,blockcount,stats];            
            let { supply, last_price : lastPrice   } = stats;

            resolve({                
                ...difficulty,
                difficultyHybrid,
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