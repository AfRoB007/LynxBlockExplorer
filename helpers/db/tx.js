var Tx = require('../../models/tx');
var { index } = require('../../lib/settings');
var moment = require('moment');

exports.getLastTransactions = (min, pageIndex, pageSize)=>{    
    min = min * 100000000;
    return new Promise((resolve,reject)=>{
        Tx
        .find({
            total: {
                $gt: min
            }
        })
        .sort({ blockindex: 'desc' })
        .skip((pageSize * pageIndex) - pageSize)
        .limit(pageSize+1)
        .lean(true)
        .exec(function(err, items) {
            if(err) reject(err);
            else {
                let length = items.length;
                for(let index = 0; index < length; index++){
                    if((index+1) < length){
                        let currentDate = new Date((items[index].timestamp) * 1000);
                        let previousDate = new Date((items[index+1].timestamp) * 1000);
                        let duration = moment.duration(moment(currentDate).diff(moment(previousDate))); 
                        
                        let blockTime = '';
                        let hours = duration.asHours();
                        let minutes = duration.asMinutes();
                        let seconds = duration.asSeconds();
                        if(seconds < 60){
                            blockTime = seconds + ' secs';
                        }else{
                            if(minutes < 60){
                                blockTime = Math.floor(minutes);
                                blockTime += blockTime>1?' mins':' min';
                            }else{
                                blockTime = Math.floor(hours);
                                blockTime += blockTime>1?' hours':' hour';
                            }                            
                        }
                        items[index].blockTime = blockTime;
                    }else{
                        items[index].blockTime = '20 secs';
                    }
                }
                if(items.length > pageSize){
                    items.pop();
                }
                resolve(items);
            }
        });
    });    
};

exports.getLastTransactionsCount = (min)=>{
    min = min * 100000000;
    return new Promise((resolve,reject)=>{
        Tx.count({
            total: {
                $gt: min
            }
        }).exec(function(err, count) {
            if(err) reject(err);
            else resolve(count);
        });
    });
};

exports.getLastTwentyFourHoursCount = (min)=>{
    min = min * 100000000;
    let currentTimestamp = Math.round(new Date().getTime() / 1000);
    var last24HoursTimestamp = currentTimestamp - (24 * 3600 * 1);

    return new Promise((resolve,reject)=>{
        Tx.count({
            total: {
                $gt: min
            },
            timestamp : {
                $gte : last24HoursTimestamp
            }
        }).exec(function(err, count) {
            if(err) reject(err);
            else resolve(count);
        });
    });
};

// exports.getAvgBlockTime = (min)=>{    
//     min = min * 100000000;
//     return new Promise((resolve,reject)=>{
//         Tx
//         .find({
//             total: {
//                 $gt: min
//             }
//         })
//         .sort({_id: 'desc'})
//         .select({ "timestamp": 1 })
//         .limit(1000)
//         .lean(true)
//         .exec(function(err, items) {
//             if(err) reject(err);
//             else {
//                 let timestamps = [];
//                 let length = items.length;
//                 for(let index = 0; index < length; index++){
//                     if((index+1) < length){
//                         let currentDate = new Date((items[index].timestamp) * 1000);
//                         let previousDate = new Date((items[index+1].timestamp) * 1000);
//                         let duration = moment.duration(moment(currentDate).diff(moment(previousDate))); 
                        
//                         timestamps.push(duration.asMinutes());
//                     }
//                 }
//                 let avgBlockTime = timestamps.reduce((acc, p) => acc + p, 0)/timestamps.length;
//                 avgBlockTime = Math.floor(avgBlockTime);
//                 avgBlockTime += avgBlockTime>0?' mins':' min';
//                 resolve(avgBlockTime);
//             }
//         });
//     });    
// };

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
        Tx
        .find({
            txid: {
                $in : txnIds
            }
        })
        .sort({
            blockindex: 'desc'
        })        
        .lean(true)
        .exec(function(err, items) {
            if(err) reject(err);
            else resolve(items);
        });
    });
}

exports.save = (model)=>{
    return new Promise((resolve,reject)=>{
        let tx = new Tx(model);
        tx.save(function(err) {
            if (err) reject(err);
            else resolve(tx);
        });
    });  
};

exports.removeAll = ()=>{
    return new Promise((resolve,reject)=>{
        Tx.remove({}, function(err, result) {
            if(err) reject(err);
            else resolve(result);
        });
    });   
};

exports.getRecentBlock = ()=>{        
    return new Promise((resolve,reject)=>{
        Tx
        .find({})
        .sort({ blockindex: 'desc' })        
        .limit(1)
        .lean(true)
        .exec(function(err, items) {
            if(err) reject(err);
            else {
                if(items.length>0){
                    resolve(items[0]);
                }else{
                    resolve(0);
                }
            }
        });
    });    
};

exports.getBlockHashByAddress = (address)=>{        
    return new Promise((resolve,reject)=>{
        Tx
        .find({
            'vout.addresses': address
        })
        .sort({ blockindex: 'desc' })        
        .limit(1)
        .lean(true)
        .exec(function(err, items) {
            if(err) reject(err);
            else {
                if(items.length>0){
                    resolve(items[0].blockhash);
                }else{
                    resolve(0);
                }
            }
        });
    });    
};

exports.getTransactions = (startIndex, endIndex) => {
    return new Promise((resolve, reject) => {
        Tx
        .find({
            $and : [
                {
                    blockindex : {
                        $gt : startIndex
                    }
                },
                {
                    blockindex : {
                        $lt : endIndex
                    }
                }
            ]
        })
        .sort({ blockindex: 'desc' })
        .lean(true)
        .exec(function(err, items) {
            if(err){
                 reject(err);
            }else {               
                resolve(items);
            }
        });
    });
};