var co = require('co');
var { db, bitcoin, lib } = require('../helpers');
var { genesis_block, confirmations } = require('../lib/settings');

exports.getBlock = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* getBlock(){
            let block = yield bitcoin.getBlockByHash(hash);
            
            block = {
                "difficulty": 2.996516052841116,
                height:hash,
                vote:2.9999999912321313,
                tx : ['0f15a8601f2136ef0f2de7ed87fa614aa55434c0fdebf50097dad08e1b3a6e68',
                'b0d319f1148f597c62377c4ce2f131d4efaa785405b78796b87cfceab8a75729']
            };
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
        co(function* getBlock(){
            let data = yield block.tx.map(txnId=> saveTx(txnId));
            console.log('createTxs',data);
        });
    });
};

const saveTx = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* saveTx(){
            let tx = yield bitcoin.getRawTransaction(hash);
            let block = yield bitcoin.getBlockByHash(tx.blockhash);

            resolve({ tx,block });            
        });
    });
};