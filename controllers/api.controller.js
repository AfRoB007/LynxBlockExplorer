var { txcount } = require('../lib/settings');
var co = require('co');
var { db } = require('../helpers');

exports.address = (req,res) =>{
    let hash = req.param('hash');
    let count = req.param('count') || txcount;
    co(function* (){
        let address = yield db.address.findOne(hash);
        if(address){            
            let addresses = address.txs.reverse().map(p=>p.addresses);
            let txs = yield db.tx.findByTxnIds(addresses);            
            res.send({
                success : true,
                data :{
                    address,
                    txs
                }
            });
        }else{
            res.send({
                success : false,
                error : hash+' not found'
            });
        }
    }).catch(err=>{
        res.status(500).send(err);        
    });
};

exports.richList = (req,res) =>{
    co(function* (){            
        let stats = db.coinStats.getCoinStats();
        let richlist = db.richlist.getRichList();        
        
        let data = yield { richlist, stats };
        if(richlist){                
            //data.distribution = getDistributionFromRichList(data);
            res.send(data);
        }else{
            res.status(500).send(new Error('Richlist not found'));
        }
    }).catch(err=>{
        res.status(500).send(err);
    });
};

const getDistributionFromRichList = ({richlist, stats}) => {
    
    let supply = stats.supply;
    let t_1_25 = { percent: 0, total: 0 };
    let t_26_50 = { percent: 0, total: 0 };
    let t_51_75 = { percent: 0, total: 0 };
    let t_76_100 = { percent: 0, total: 0 };
    let t_101plus = { percent: 0, total: 0 };

    let length = richlist.balance.length;
    for(let index=0; index<length; index++){
        let count = index + 1;
        let percentage = richlist.balance[index].balance / 100000000 / stats.supply * 100;
        if (count <= 25) {
            t_1_25.percent = t_1_25.percent + percentage;
            t_1_25.total = t_1_25.total + richlist.balance[index].balance / 100000000;
        }
        if (count <= 50 && count > 25) {
            t_26_50.percent = t_26_50.percent + percentage;
            t_26_50.total = t_26_50.total + richlist.balance[index].balance / 100000000;
        }
        if (count <= 75 && count > 50) {
            t_51_75.percent = t_51_75.percent + percentage;
            t_51_75.total = t_51_75.total + richlist.balance[index].balance / 100000000;
        }
        if (count <= 100 && count > 75) {
            t_76_100.percent = t_76_100.percent + percentage;
            t_76_100.total = t_76_100.total + richlist.balance[index].balance / 100000000;
        }
    }

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

    return { 
        supply, 
        t_1_25, 
        t_26_50, 
        t_51_75, 
        t_76_100, 
        t_101plus 
    };
};