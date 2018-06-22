var Tx = require('../../models/tx');
var { index } = require('../../lib/settings');

exports.getLastTransactions = (min)=>{
    let count = index.last_txs;
    min = min * 100000000;
    return Tx.find({'total': {$gt: min}}).sort({_id: 'desc'}).limit(count).exec();
};