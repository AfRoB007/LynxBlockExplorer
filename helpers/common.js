var co = require('co');
var { db } = require('./db');
var lib = require('./lib');
var bitcoin = require('./bitcoin');
var markets = require('./markets');
var settings = require('../lib/settings');

const updateDb = function(coin){
    return new Promise(function (resolve,reject) {
        co(function* () {
            let stats = yield db.coinStats.getCoinStats();
            if(stats){
                let count = yield bitcoin.getBlockCount();      
                console.log('count',count);     
                let supply = yield bitcoin.getSupply();
                console.log('supply',supply);   
                let connections = yield bitcoin.getConnections();
                console.log('connections',connections); 
                let result = yield db.coinStats.update({
                    coin,
                    count,
                    supply,
                    connections
                });
                stats = yield db.coinStats.getCoinStats();
            }
            resolve(stats);
        }).catch(err=>{
            console.log('updateDb err',err);
        });
    });
}

const updateTxnsDb =(start,end)=>{
    return new Promise(function (resolve,reject) {
        co(function* () {
            let length = (end - start) +1;
            console.log('length',length);
            for(let index=0; index < length; index++){
                // if (index % 5000 === 0) {
                //     let result = yield db.coinStats.update({
                //         last: start + index - 1,
                //         last_txs: '' //not used anymore left to clear out existing objects
                //     });
                // }                
                let blockHash = yield bitcoin.getBlockHash(start + index);                
                if(blockHash!=='There was an error. Check your console.'){                    
                    let block = yield bitcoin.getBlockByHash(blockHash);
                    console.log('block',start + index);
                    // if(block!=='There was an error. Check your console.'){                        
                    //     let txLength = block.tx.length;
                    //     for(let i=0; i < txLength; i++){
                    //         let txnId = block.tx[i];
                    //         let tx = yield db.tx.findOne(txnId);                            
                    //         if(tx===null){
                    //             console.log(`Creating tx for ${txnId}`);
                    //             //yield saveTx(txnId);                                
                    //         }else{
                    //             console.log(`Tx already exist for ${txnId}`);
                    //         }
                    //     }
                    // }
                }
            }
            let result = yield db.coinStats.update({
                last: end,
                last_txs: '' //not used anymore left to clear out existing objects
            });
            let stats = yield db.coinStats.getCoinStats();
            console.log('updateTxnsDb end');
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

const updateMarketsDb =(market)=>{
    return new Promise(function (resolve,reject) {
        co(function* () {            
            let data = yield markets.getMarketData(market);
            if(data){
                yield db.markets.update(market,{
                    chartdata: JSON.stringify(data.chartdata),
                    buys: data.buys,
                    sells: data.sells,
                    history: data.trades,
                    summary: data.stats
                });
                if (market == settings.markets.default ) {
                    yield db.coinStats.update({
                        last_price: data.stats.last
                    });                    
                }
            }
            resolve();
        }).catch(reject);
    });
};

const saveTx = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let tx = yield bitcoin.getRawTransaction(hash);
            if(tx==='There was an error. Check your console.'){
                resolve();
            }else{          
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
                    //reject(new Error('Block not found: ' + tx.blockhash));
                    resolve();
                }
            }            
        });
    });
};

const updateAddress = (hash, txid, amount,type)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            try{
                let address = yield db.address.findAddress(hash);
                if(address){
                    if (hash == 'coinbase') {
                        address = yield db.address.update(hash,{
                            sent: address.sent + amount,
                            balance: 0
                        });                    
                    }else{
                        let tx_array = address.txs;
                        var received = address.received;
                        var sent = address.sent;
                        if (type == 'vin') {
                            sent = sent + amount;
                        } else {
                            received = received + amount;
                        }          
                        let index = address.txs.findIndex(p=> p.address === txid);
                        //push to array
                        if(index===-1){                    
                            tx_array.push({addresses: txid, type: type});
                            if ( tx_array.length > txcount ) {
                                tx_array.shift();
                            }
                            address = yield db.address.update(hash,{
                                txs: tx_array,
                                received: received,
                                sent: sent,
                                balance: received - sent
                            });
                        }else if(index>-1 && type !== tx_array[index].type){
                            address = yield db.address.update(hash,{
                                txs: tx_array,
                                received: received,
                                sent: sent,
                                balance: received - sent
                            });
                        }
                    }
                    resolve(address);
                }else{
                    if(type==='vin'){
                        address = yield db.address.save({
                            a_id: hash,
                            txs: [ { addresses: txid, type } ],
                            sent: amount,
                            balance: amount,
                        });
                    }else{
                        address = yield db.address.save({
                            a_id: hash,
                            txs: [ {addresses: txid, type: 'vout'} ],
                            received: amount,
                            balance: amount,
                        });
                    }
                    resolve(address);
                }
            }catch(err){
                //resolve null
                resolve(null);
            }
        });
    });
};

module.exports.updateDb = updateDb;
module.exports.updateTxnsDb = updateTxnsDb;
module.exports.updateHeavy = updateHeavy;
module.exports.updateMarketsDb = updateMarketsDb;
module.exports.saveTx = saveTx;
