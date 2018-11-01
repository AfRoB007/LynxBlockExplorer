var Block = require('../../models/block');
var moment = require('moment');

exports.getRecentBlock = ()=>{    
    return new Promise((resolve,reject)=>{
        Block
        .find({})
        .sort({ blockindex : 'desc' })        
        .limit(1)
        .lean(true)
        .exec(function(err, items) {
            if(err){
                reject(err);
            }else {      
                resolve(items[0] || null);
            }
        });
    });    
};

exports.insertMany = (blocks)=>{
    return new Promise((resolve,reject)=>{
        if(blocks.length>0){
            Block.insertMany(blocks, function(err,items){
                if(err){
                    reject(err);
                }else {      
                    resolve(items);
                }
            });
        }else{
            resolve([]);
        }
    });  
};

exports.getRecentBlocks = (pageIndex, pageSize)=>{        
    return new Promise((resolve,reject)=>{
        Block
        .find({})
        .sort({ blockindex: 'desc' })
        .skip((pageSize * pageIndex) - pageSize)
        .limit(pageSize+1)
        .lean(true)
        .exec(function(err, items) {
            if(err) reject(err);
            else {
                let length = items.length;
                for (let index = 0; index < length; index++) {
                    if ((index + 1) < length) {
                        let currentDate = new Date((items[index].timestamp) * 1000);
                        let previousDate = new Date((items[index + 1].timestamp) * 1000);
                        let duration = moment.duration(moment(currentDate).diff(moment(previousDate)));

                        let blockTime = '';
                        let hours = duration.asHours();
                        let minutes = duration.asMinutes();
                        let seconds = duration.asSeconds();
                        if (seconds < 60) {
                            blockTime = seconds + ' secs';
                        } else {
                            if (minutes < 60) {
                                blockTime = Math.floor(minutes);
                                blockTime += blockTime > 1 ? ' mins' : ' min';
                            } else {
                                blockTime = Math.floor(hours);
                                blockTime += blockTime > 1 ? ' hours' : ' hour';
                            }
                        }
                        items[index].blockTime = blockTime;
                    } else {
                        items[index].blockTime = '20 secs';
                    }
                }
                if (items.length > pageSize) {
                    items.pop();
                }
                resolve(items);
            }
        });
    });    
};

exports.getRecentBlocksCount = ()=>{    
    return new Promise((resolve,reject)=>{
        Block.count({}).exec(function(err, count) {
            if(err) reject(err);
            else resolve(count);
        });
    });
};

exports.getAvgBlockTime = ()=>{        
    return new Promise((resolve,reject)=>{
        Block
        .find({})
        .sort({ blockindex: 'desc' })
        .select({ "timestamp": 1 })
        .limit(1000)
        .lean(true)
        .exec(function(err, items) {
            if(err) reject(err);
            else {
                let timestamps = [];
                let length = items.length;
                for(let index = 0; index < length; index++){
                    if((index+1) < length){
                        let currentDate = new Date((items[index].timestamp) * 1000);
                        let previousDate = new Date((items[index+1].timestamp) * 1000);
                        let duration = moment.duration(moment(currentDate).diff(moment(previousDate))); 
                        
                        timestamps.push(duration.asMinutes());
                    }
                }
                let avgBlockTime = timestamps.reduce((acc, p) => acc + p, 0)/timestamps.length;
                avgBlockTime = Math.floor(avgBlockTime);
                avgBlockTime += avgBlockTime>0?' mins':' min';
                resolve(avgBlockTime);
            }
        });
    });    
};

exports.getBlockHashListToInsert = (blockHashList)=>{
    return new Promise((resolve,reject)=>{
        Block
        .find({
            blockhash : {
                $in : blockHashList.map(p=>p.blockhash)
            }
        })
        .select({ blockhash : 1, _id : 0})
        .lean(true)
        .exec(function(err, items) {
            if(err){
                reject(err);
            }else {    
                items = items.map(p=>p.blockhash);
                blockHashList = blockHashList.filter(p=>{
                    return !items.includes(p.blockhash);
                });
                resolve(blockHashList);
            }
        });
    });    
};