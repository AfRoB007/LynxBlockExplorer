var co = require('co');
var { db, bitcoin, lib } = require('../helpers');
exports.getAddress = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* findAddress(){
            let address = db.address.findOne(hash);
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