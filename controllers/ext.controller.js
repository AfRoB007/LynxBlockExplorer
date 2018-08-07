var { txcount, markets } = require('../lib/settings');
var co = require('co');
var { bitcoin, db, common } = require('../helpers');

exports.latestTxs = (req, res, next) =>{        
    co(function* (){
        let pageIndex = 1;
        let pageSize = 10;
        let min = 0.00000001;
        if(req.query.pageIndex){
            pageIndex = parseInt(req.query.pageIndex);
        }
        if(req.query.pageSize){
            pageSize = parseInt(req.query.pageSize);
        }
        let grid = {            
            items : yield db.tx.getLastTransactions(min, pageIndex, pageSize),
            count : yield db.tx.getLastTransactionsCount(min),            
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
    }).catch(next);
};

exports.address = (req, res, next) =>{    
    co(function* (){
        let hash = req.param('hash');
        let address = yield db.address.findOne(hash);
        if(address){            
            let addresses = address.txs.reverse().map(p=>p.addresses);
            let txs = yield db.tx.findByTxnIds(addresses);            
            res.send({
                address,
                txs
            });
        }else{
            res.send(hash+' not found');
        }
    }).catch(next);
};

exports.balance = (req, res, next) =>{
    co(function* (){
        let hash = req.param('hash');
        let address = yield db.address.findOne(hash);
        if(address){ 
            let balance = (address.balance / 100000000).toString().replace(/(^-+)/mg, ''); 
            res.send(balance);
        }else{
            res.send(hash+' not found');
        }
    }).catch(next);
};

exports.distribution = (req, res, next) =>{
    co(function* (){            
        let stats = db.coinStats.getCoinStats();
        let richlist = db.richlist.getRichList();        
        
        let data = yield { richlist, stats };
        if(richlist){                
            data.distribution = common.getDistribution(data);
            return res.send(data.distribution);
        }
        throw new Error('Distribution not found');
    }).catch(next);
};

exports.moneySupply = (req, res, next) =>{
    co(function* (){            
        let supply = yield bitcoin.getSupply();
        res.send(supply.toString());
    }).catch(next);
};