var { txcount, markets } = require('../lib/settings');
var co = require('co');
var { bitcoin, db, common } = require('../helpers');

exports.getRecentBlock = (req, res, next)=>{
    co(function *(){        
        let block = yield db.tx.getRecentBlock();
        res.send({
            blockIndex : block.blockIndex
        });
    }).catch(next);
};

exports.latestBlocks = (req, res, next) =>{        
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
    }).catch(next);
};

exports.address = (req, res, next) =>{    
    co(function* (){
        let hash = req.param('hash');
        let count = req.param('count') || txcount;
        let address = yield db.address.findOne(hash);
        if(address){            
            let addresses = address.txs.reverse().map(p=>p.addresses);
            let txs = yield db.tx.findByTxnIds(addresses);
            let blockHash = yield db.tx.getBlockHashByAddress(hash);
            res.send({
                success : true,
                data :{
                    blockHash,
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
    }).catch(next);
};

exports.richList = (req, res, next) =>{
    co(function* (){            
        let stats = db.coinStats.getCoinStats();
        let richlist = db.richlist.getRichList();        
        
        let data = yield { richlist, stats };
        if(richlist){                
            data.distribution = common.getDistribution(data);
            return res.send(data);
        }
        throw new Error('Richlist not found');
    }).catch(next);
};

exports.connections = (req, res, next) =>{       
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
    }).catch(next);
};

exports.updateConnections = (req, res, next) =>{       
    co(function* (){
        let updatedCount = 0;
        let items = yield db.peers.getPeersToUpdate();        
        let length = items.length;
        for(let index=0; index < length; index++){            
            let country = yield common.getCountryName(items[index].address);            
            if(country){
                items[index].country = country;
                yield db.peers.update(items[index]._id, items[index]);
                updatedCount++;
            }
        }
        res.send({
            message : `${updatedCount} peers updated.`
        });
    }).catch(next);
};

exports.market = (req, res, next) =>{      
    co(function* () {
        let { market } = req.params; 
        market = market.toLowerCase();
        if(markets.enabled.indexOf(market)>-1){
            let isAlreadyExist = yield db.markets.isAlreadyExist(market);
            if (isAlreadyExist) {
                yield common.updateMarketsDb(market);
                console.log('markets updated for %s',market);        
            }
        }
        let data = yield db.markets.getMarkets(market);
        res.send(data);
    }).catch(next);
};