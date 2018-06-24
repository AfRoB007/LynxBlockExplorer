var co = require('co');
var { db, bitcoin, lib } = require('../helpers');

exports.getAddress = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* findAddress(){
            let address = db.address.findAddress(hash);
            resolve(yield address);
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getBlockHash = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* findBlockHash(){
            let block = bitcoin.getBlockHash(hash);
            resolve(yield block);
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getBlock = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* findBlock(){
            let block = bitcoin.getBlock(hash);
            resolve(yield block);
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.findTransactionById = (txnId)=>{
    return new Promise((resolve,reject)=>{
        co(function* findTransactionById(){
            let txn = db.tx.findOne(txnId);
            resolve(yield txn);
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getAddressAndTxns = (hash,count)=>{
    return new Promise((resolve,reject)=>{
        db.address.findAddress(hash).find(address=>{
            if(address){
                let txs = [];
                let hashes = address.txs.reverse();
                if (address.txs.length < count) {
                    count = address.txs.length;
                }
                lib.syncLoop(count, function (loop) {
                let i = loop.iteration();
                db.get_tx(hashes[i].addresses, function(tx) {
                    if (tx) {
                        txs.push(tx);
                        loop.next();
                    } else {
                        loop.next();
                    }
                });
                }, ()=>{
                    resolve({
                        address,
                        txs
                    });
                });
            }else{
                reject(new Error(hash+' not found'));
            }
        }).catch(err=>reject(err));
    });    
};