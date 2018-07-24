var co = require('co');
var { db } = require('./db');
var lib = require('./lib');
var bitcoin = require('./bitcoin');

const updateDb = function(coin){
    return new Promise(function (resolve,reject) {
        co(function* () {
            let stats = yield db.coinStats.getCoinStats();
            if(stats){
                let count = yield bitcoin.getBlockCount();
                console.log('count',count);
                let supply = yield bitcoin.getSupply();
                let connections = yield bitcoin.getConnections();
            
                let result = yield db.coinStats.update({
                    coin,
                    count,
                    supply,
                    connections
                });
                stats = yield db.coinStats.getCoinStats();
            }
            resolve(stats);
        }).catch(reject);
    });
}

const updateTxnsDb =(start,end)=>{
    return new Promise(function (resolve,reject) {
        co(function* () {
            let length = (end - start) +1;
            for(let index=0; index < length; index++){
                if (index % 5000 === 0) {
                    let result = yield db.coinStats.update({
                        last: start + index - 1,
                        last_txs: '' //not used anymore left to clear out existing objects
                    });
                }
                let blockHash = yield bitcoin.getBlockHash(start + index);
                console.log('block hash', blockHash);
                let block = yield bitcoin.getBlockByHash(blockHash);
                if(block!=='There was an error. Check your console.'){
                    console.log('block',block);
                    let txLength = block.tx.length;
                    for(let index=0; index < txLength; index++){
                        let txnId = block.tx[index];
                        let tx = yield db.tx.findOne(txnId);
                        if(tx===null){
                            tx = yield saveTx(txnId);
                        }
                    }
                }
            }
            let result = yield db.coinStats.update({
                last: end,
                last_txs: '' //not used anymore left to clear out existing objects
            });
            let stats = yield db.coinStats.getCoinStats();
            resolve(stats);
        }).catch(reject);
    });
};

const updateHeavy =(height, count)=>{
    return new Promise(function (resolve,reject) {
        co(function* () {
            var votes = [];
            let cap = yield bitcoin.getMaxMoney();
            let maxvote = yield bitcoin.getMaxVote();
            let lvote = yield bitcoin.getVote();
            let phase = yield bitcoin.getPhase();
            let reward = yield bitcoin.getReward();
            let supply = yield bitcoin.getSupply();
            let estnext = yield bitcoin.getEstNext();
            let nextin = yield bitcoin.getNextIn();

            for(let index=0; index < count; index++){
                let hash = yield bitcoin.getBlockHash(height-index);
                let block = yield bitcoin.getBlockHash(hash);
                votes.push({
                    count:height-index,
                    reward:block.reward,
                    vote:block.vote
                });
            }
            let heavy = yield db.heavy.update({
                lvote,
                reward,
                supply,
                cap,
                estnext,
                phase: phase,
                maxvote,
                nextin,
                votes,
            });
            resolve(heavy);
        }).catch(reject);
    });
};

const saveTx = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let tx = yield bitcoin.getRawTransaction(hash);
            let block = yield bitcoin.getBlockByHash(tx.blockhash);
            if(block){                
                let vin = yield lib.prepare_vin(tx);                
                let { vout, nvin } = yield lib.prepare_vout(tx.vout, hash, vin);               
                //update vin address
                let vinAddresses =  yield nvin.map(p=> updateAddress(p.addresses, hash, p.amount, 'vin'));                
                //update vout address
                let voutAddresses = yield vout.map(p=> updateAddress(p.addresses, hash, p.amount, 'vout'));
                //calculate total
                let total = vout.reduce((acc, p) => acc + p.amount, 0);
                let newTx = yield db.tx.save({
                    txid: tx.txid,
                    vin: nvin,
                    vout: vout,
                    total: total.toFixed(8),
                    timestamp: tx.time,
                    blockhash: tx.blockhash,
                    blockindex: block.height,
                });                
                resolve(newTx);
            }else{
                reject(new Error('Block not found: ' + tx.blockhash));
            }     
        });
    });
};

module.exports.updateDb = updateDb;
module.exports.updateTxnsDb = updateTxnsDb;
module.exports.updateHeavy = updateHeavy;
module.exports.saveTx = saveTx;
