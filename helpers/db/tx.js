var Tx = require('../../models/tx');
var { index } = require('../../lib/settings');

exports.getLastTransactions = (min)=>{
    let count = index.last_txs;
    min = min * 100000000;
    return Tx.find({'total': {$gt: min}}).sort({_id: 'desc'}).limit(count).exec();
};

exports.findOne = (txnId)=>{
    return new Promise((resolve,reject)=>{
        Tx.findOne({ txid: txnId }, (err,data)=>{
            if(err) reject(err);
            else resolve(data);
        });
    });
}

exports.findByTxnIds = (txnIds)=>{
    return new Promise((resolve,reject)=>{
        Tx.find({ txid: {
            $in : txnIds
        }}, (err,data)=>{
            if(err) reject(err);
            else resolve(data);
        });
    });
}