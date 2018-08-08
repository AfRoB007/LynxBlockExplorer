var { movement, api, markets,
    genesis_tx, genesis_block, txcount, confirmations, txcount } = require('../lib/settings');
var rewardRepository = require('../data-access/reward.repository');
var Decimal = require('decimal.js');

var co = require('co');
var qr = require('qr-image');
var { bitcoin, cryptoCompare, db, common } = require('../helpers');

//index
exports.index = (req, res, next) =>{
    co(function* (){
        let avgBlockTime = 0;
        let min = 0.00000001;
        let count = yield db.tx.getLastTransactionsCount(min);
        if(count >= 1000){
            avgBlockTime = yield db.tx.getAvgBlockTime(min);
        }

        let data = {
            ... yield bitcoin.getDifficulty(),
            hashrate : yield bitcoin.getHashRate(),
            connections : yield bitcoin.getConnections(),
            liteCoin : yield cryptoCompare.getLitecoin(),
            liteCoinPrice : yield cryptoCompare.getCoinPrice('LTC','USD'),
            //coin : yield cryptoCompare.getCoin(),
            blockIndex : yield db.tx.getRecentBlock(),
            coinPrice : yield cryptoCompare.getCoinPrice('LYNX','LTC'),
            blockIndex : yield db.tx.getRecentBlock(),
            avgBlockTime,
            markets
        };
        data.usdPrice = data.liteCoinPrice * data.coinPrice;
        //data.marketCap =  Number(data.coin.General.TotalCoinSupply) * data.usdPrice;
        data.marketCap =  1 * data.usdPrice;
        res.render('explorer', data);
    }).catch(next);    
};

//latest-blocks
exports.latestBlocks = (req, res, next) =>{
    co(function* (){
        let data = {           
            blockIndex : yield db.tx.getRecentBlock(),
            markets
        };
        res.render('latest-blocks', data);
    }).catch(next);
};

exports.block = (req, res, next) =>{    
    let hash = req.param('hash');
    co(function* (){
        let blockIndex = yield db.tx.getRecentBlock();
        let block = yield bitcoin.getBlockByHash(hash);
        let txs = null;
        if(block !== bitcoin.CONSOLE_ERROR && hash === genesis_block){
            txs = 'GENESIS';
        }else{
            txs = yield db.tx.findByTxnIds(block.tx);            
            if(txs.length===0){                
                let txLength = block.tx.length;
                for(let i=0; i < txLength; i++){
                    let txnId = block.tx[i];
                    let tx = yield db.tx.findOne(txnId);                            
                    if(tx===null){                                
                        yield common.saveTx(txnId);                                
                    }
                }                
                txs = yield db.tx.findByTxnIds(block.tx);            
            }
        }
        block.difficultyToFixed = new Decimal(block.difficulty).toFixed(6);       
        res.render('block', {             
            blockIndex,
            block,
            markets, 
            confirmations, 
            txs
        });
    }).catch(next);
};

//address:hash
exports.address = (req, res, next) =>{
    let hash = req.param('hash');
    let count = req.param('count') || txcount;
    co(function* (){
        let data = {           
            blockIndex : yield db.tx.getRecentBlock(),
            hash,
            markets
        };
        res.render('address', data);
    }).catch(next);    
};

//tx
exports.tx = (req, res, next) =>{
    let hash = req.param('txid');
    co(function* (){
        let blockIndex = yield db.tx.getRecentBlock();
        let tx = yield db.tx.findOne(hash);
        if(tx){            
            let blockcount = yield bitcoin.getBlockCount();
            res.render('tx', {
                blockIndex,
                tx, 
                confirmations, 
                blockcount,
                markets
            }); 
        }else{
            let rtx = yield bitcoin.getRawTransaction(hash);
            if (rtx.txid) {
                let vin = yield lib.prepare_vin(rtx);  
                let { rvout, rvin } = yield lib.prepare_vout(rtx.vout, rtx.txid, vin);
                let total = rvout.reduce((acc, p) => acc + p.amount, 0);
                
                let utx = {
                    txid: rtx.txid,
                    vin: rvin,
                    vout: rvout,
                    total: total.toFixed(8),
                    timestamp: rtx.time                        
                };
                if (!rtx.confirmations > 0) {
                    utx.blockhash = '-';
                    utx.blockindex = -1;
                    res.render('tx', {
                        blockIndex,
                        tx: utx, 
                        confirmations, 
                        blockcount:-1,
                        markets
                    });
                }else{
                    utx.blockhash = rtx.blockhash;
                    utx.blockindex =  rtx.blockheight;
                    
                    let blockcount = yield bitcoin.getBlockCount();
                    res.render('tx', {   
                        blockIndex,                      
                        tx: utx, 
                        confirmations, 
                        blockcount,
                        markets
                    });
                }
            }else{
                res.status(500).send(new Error('Txn not found '+hash));
            }
        }
    }).catch(next);
};

//qr:hash
exports.getQRImage = (req,res) =>{
    let hash = req.param('hash');
    let address = qr.image(hash, {
        type: 'png',
        size: 7,
        margin: 1,
        ec_level: 'M'
    });
    res.type('png');
    address.pipe(res);
};

//search
exports.search = (req,res)=>{
    let { query : { q: search } } = req;  
    let referer = req.header('Referer') || '/';

    co(function* (){
        if(search.length===64){
            if(search === genesis_tx) {
                return res.redirect('/block/' + genesis_block);
            }            
            let block = yield bitcoin.getBlockByHash(search);
            if(block !== bitcoin.CONSOLE_ERROR){
                return res.redirect('/block/'+search);
            }
        }
        let txn = yield db.tx.findOne(search);
        if(txn){
            return res.redirect('/tx/'+search);
        }
        let blockHash = yield bitcoin.getBlockHash(search);        
        if(blockHash !== bitcoin.CONSOLE_ERROR){            
            return res.redirect('/block/'+blockHash);
        }
        let address = yield db.address.findOne(search);        
        if(address){
            return res.redirect('/address/' + address.a_id);
        }        
        req.session['error'] = `No results found for : ${search}`;
        res.redirect(referer);
    }).catch(err=>{
        req.session['error'] = err.message;
        res.redirect(referer);        
    });
};

//richlist
exports.richList = (req, res, next) =>{
    co(function* (){
        let blockIndex = yield db.tx.getRecentBlock();        
        res.render('rich-list', {                
            blockIndex,
            markets
        });
    }).catch(next);
};

exports.market = (req, res, next) =>{
    let { market } = req.params;   
    if (markets.enabled.indexOf(market) != -1) {
        co(function* (){
            let coin = yield cryptoCompare.getCoin();      
            let blockIndex = coin.General.BlockNumber;      
            res.render('markets_' + market, {                
                blockIndex,
                markets,
                market
            });
        }).catch(next);
    }else{
        res.redirect('/');
    }
};

exports.reward = (req, res, next) =>{    
    rewardRepository.getReward().then(data=>{        
        res.render('reward', { 
            active: 'reward', 
            ...data
        });
    }).catch(next);
};

//network
exports.network = (req, res, next) =>{
    co(function* (){
        let data = {  
            blockIndex : yield db.tx.getRecentBlock(),
            markets
        };
        res.render('network', data);
    }).catch(next);
};

//api
exports.info = (req,res) =>{    
    let baseUrl = req.protocol + '://' + req.get('host');
    res.render('info', {       
        baseUrl: baseUrl, 
        hashes: api,
        markets
    });
};

exports.movement = (req,res) =>{
    res.render('movement', {
        active: 'movement', 
        flaga: movement.low_flag, 
        flagb: movement.high_flag, 
        min_amount: movement.min_amount
    });
};