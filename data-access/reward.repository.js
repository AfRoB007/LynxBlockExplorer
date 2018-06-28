var co = require('co');
var { db } = require('../helpers');

exports.getReward = ()=>{
    return new Promise((resolve,reject)=>{
        co(function* getReward(){
            let stats = db.coinStats.getCoinStats();
            let heavy = db.heavy.getHeavy();
            let data = yield { stats, heavy };

            let votes = [];
            if(data.heavy){
                votes = data.heavy.votes;
                votes.sort((a,b)=> {
                    if (a.count < b.count) {
                        return -1;
                    } else if (a.count > b.count) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            }
            resolve({ ...data, votes });
        }).catch(err=>{
            reject(err);
        });
    });    
};