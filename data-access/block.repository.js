var co = require('co');
var { db, bitcoin, lib } = require('../helpers');
var { genesis_block, confirmations, txcount } = require('../lib/settings');

exports.getBlock = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* getBlock(){
            let block = yield bitcoin.getBlockByHash(hash);
            if(block==='There was an error. Check your console.'){
                reject(new Error('Block not found: ' + hash));
            } else if(block !== 'There was an error. Check your console.' && hash === genesis_block){
                resolve({ block, confirmations, txs : 'GENESIS' });                
            }else{
                let txs = yield db.tx.findByTxnIds(block.tx);
                resolve({ block, confirmations, txs });                           
            }
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.createTxs = (block)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let data = yield block.tx.map(txnId=> saveTx(txnId));
            let txs = yield db.tx.findByTxnIds(block.tx);
            resolve({ block, confirmations, txs });  
        });
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

const updateAddress = (hash, txid, amount,type)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            try{
                let address = yield db.address.findOne(hash);
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