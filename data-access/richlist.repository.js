var co = require('co');
var { bitcoin, db, lib } = require('../helpers');

exports.getData = ()=>{
    return new Promise((resolve,reject)=>{        
        co(function* getData(){            
            let stats = db.coinStats.getCoinStats();
            let richlist = db.richlist.getRichList();

            let data = yield { richlist, stats };
            if(data.richlist){                
                let distribution = yield getDistributionFromRichList(data);
                resolve({ ...data, distribution });
            }else{
                reject(new Error('Richlist not found'));
            }
        }).catch(err=>{
            reject(err);
        });
    });    
};

exports.getDistribution = ()=>{
    return new Promise((resolve,reject)=>{        
        co(function* getDistribution(){            
            let stats = db.coinStats.getCoinStats();
            let richlist = db.richlist.getRichList();

            let data = yield { richlist, stats };
            if(data.richlist){                
                let distribution = yield getDistributionFromRichList(data);
                resolve(distribution);
            }else{
                reject(new Error('Richlist not found'));
            }
        }).catch(err=>{
            reject(err);
        });
    });    
};

const getDistributionFromRichList = ({richlist, stats}) => {
    return new Promise((resolve,reject)=>{
        let supply = stats.supply;
        let t_1_25 = { percent: 0, total: 0 };
        let t_26_50 = { percent: 0, total: 0 };
        let t_51_75 = { percent: 0, total: 0 };
        let t_76_100 = { percent: 0, total: 0 };
        let t_101plus = { percent: 0, total: 0 };

        lib.syncLoop(richlist.balance.length,function (loop) {
            var i = loop.iteration();
            var count = i + 1;
            var percentage =
                richlist.balance[i].balance / 100000000 / stats.supply * 100;
            if (count <= 25) {
                t_1_25.percent = t_1_25.percent + percentage;
                t_1_25.total = t_1_25.total + richlist.balance[i].balance / 100000000;
            }
            if (count <= 50 && count > 25) {
                t_26_50.percent = t_26_50.percent + percentage;
                t_26_50.total = t_26_50.total + richlist.balance[i].balance / 100000000;
            }
            if (count <= 75 && count > 50) {
                t_51_75.percent = t_51_75.percent + percentage;
                t_51_75.total = t_51_75.total + richlist.balance[i].balance / 100000000;
            }
            if (count <= 100 && count > 75) {
                t_76_100.percent = t_76_100.percent + percentage;
                t_76_100.total = t_76_100.total + richlist.balance[i].balance / 100000000;
            }
            loop.next();
        },
        function () {
            t_101plus.percent = parseFloat(100 - t_76_100.percent - t_51_75.percent - t_26_50.percent - t_1_25.percent).toFixed(2);
            t_101plus.total = parseFloat(supply - t_76_100.total - t_51_75.total - t_26_50.total - t_1_25.total ).toFixed(8);
            t_1_25.percent = parseFloat(t_1_25.percent).toFixed(2);
            t_1_25.total = parseFloat(t_1_25.total).toFixed(8);
            t_26_50.percent = parseFloat(t_26_50.percent).toFixed(2);
            t_26_50.total = parseFloat(t_26_50.total).toFixed(8);
            t_51_75.percent = parseFloat(t_51_75.percent).toFixed(2);
            t_51_75.total = parseFloat(t_51_75.total).toFixed(8);
            t_76_100.percent = parseFloat(t_76_100.percent).toFixed(2);
            t_76_100.total = parseFloat(t_76_100.total).toFixed(8);

            return resolve({ supply, t_1_25, t_26_50, t_51_75, t_76_100, t_101plus });
        });
    });
};
