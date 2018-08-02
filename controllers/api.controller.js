var { txcount } = require('../lib/settings');
var co = require('co');
var { bitcoin, cryptoCompare, db } = require('../helpers');

exports.getCoinDetails = (req,res)=>{
    co(function *(){
        let coin = yield cryptoCompare.getCoin();
        res.send(coin);
    }).catch(err=>{
        res.status(500).send(err);
    });
};

exports.latestBlocks = (req,res) =>{    
    let pageIndex = 1;
    let pageSize = 10;
    let min = 0.00000001;
    if(req.query.pageIndex){
        pageIndex = parseInt(req.query.pageIndex);
    }
    if(req.query.pageSize){
        pageSize = parseInt(req.query.pageSize);
    }
    co(function* (){
        let grid = {            
            items : yield db.tx.getLastTransactions(min, pageIndex, pageSize),
            count : yield db.tx.getLastTransactionsCount(min),
            ... yield bitcoin.getDifficulty(),
            pageIndex,
            pageSize
        };
        let length = grid.items.length;
        for(let index=0; index < length; index++){
            if(grid.items[index].vout.length>0){
                let hash = grid.items[index].vout[0].addresses;
                let address = yield db.address.findOne(hash);
                if(address){
                    grid.items[index].txsCount = address.txs.length;
                }
            }
        }
        res.send(grid);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

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
            data.distribution = getDistribution(data);
            res.send(data);
        }else{
            res.status(500).send(new Error('Richlist not found'));
        }
    }).catch(err=>{
        res.status(500).send(err);
    });
};

exports.connections = (req,res) =>{       
    co(function* (){
        let pageIndex = 1;
        let pageSize = 10;
        if(req.query.pageIndex){
            pageIndex = parseInt(req.query.pageIndex);
        }
        if(req.query.pageSize){
            pageSize = parseInt(req.query.pageSize);
        }
        let grid = {
            items : yield db.peers.getPeers(pageIndex, pageSize),
            count : yield db.peers.getPeersCount(),
            pageIndex,
            pageSize
        };        
        res.send(grid);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

const getDistribution = ({richlist, stats}) => {
    
    let supply = stats.supply;
    let data = {
        supply,
        top_1_25 : {
            percent : 0,
            total : 0,
            bgColor : '#ff6384',
            label : 'Top 1-25'
        },
        top_26_50 : {
            percent : 0,
            total : 0,
            bgColor : '#8bc34a',
            label : 'Top 26-50'
        },
        top_51_75 : {
            percent : 0,
            total : 0,
            bgColor : '#36a2eb',
            label : 'Top 51-75'
        },
        top_76_100 : {
            percent : 0,
            total : 0,
            bgColor : '#607d8b',
            label : 'Top 76-100'
        },
        top_100_plus : {
            percent : 0,
            total : 0,
            bgColor : '#9e9e9e',
            label : 'unredeemed'
        }
    };
    let { top_1_25, top_26_50, top_51_75, top_76_100, top_100_plus } = data;

    let length = richlist.balance.length;
    for(let index=0; index<length; index++){
        let count = index + 1;
        let percentage = richlist.balance[index].balance / 100000000 / stats.supply * 100;
        if (count <= 25) {
            top_1_25.percent = top_1_25.percent + percentage;
            top_1_25.total = top_1_25.total + richlist.balance[index].balance / 100000000;
        }
        if (count <= 50 && count > 25) {
            top_26_50.percent = top_26_50.percent + percentage;
            top_26_50.total = top_26_50.total + richlist.balance[index].balance / 100000000;
        }
        if (count <= 75 && count > 50) {
            top_51_75.percent = top_51_75.percent + percentage;
            top_51_75.total = top_51_75.total + richlist.balance[index].balance / 100000000;
        }
        if (count <= 100 && count > 75) {
            top_76_100.percent = top_76_100.percent + percentage;
            top_76_100.total = top_76_100.total + richlist.balance[index].balance / 100000000;
        }
    }

    top_100_plus.percent = parseFloat(100 - top_76_100.percent - top_51_75.percent - top_26_50.percent - top_1_25.percent).toFixed(2);
    top_100_plus.total = parseFloat(supply - top_76_100.total - top_51_75.total - top_26_50.total - top_1_25.total ).toFixed(8);
    top_1_25.percent = parseFloat(top_1_25.percent).toFixed(2);
    top_1_25.total = parseFloat(top_1_25.total).toFixed(8);
    top_26_50.percent = parseFloat(top_26_50.percent).toFixed(2);
    top_26_50.total = parseFloat(top_26_50.total).toFixed(8);
    top_51_75.percent = parseFloat(top_51_75.percent).toFixed(2);
    top_51_75.total = parseFloat(top_51_75.total).toFixed(8);
    top_76_100.percent = parseFloat(top_76_100.percent).toFixed(2);
    top_76_100.total = parseFloat(top_76_100.total).toFixed(8);

    return data;
};