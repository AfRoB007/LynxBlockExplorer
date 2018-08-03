var { movement, address, api, show_sent_received, markets,
    genesis_tx, genesis_block, txcount, confirmations, txcount } = require('../lib/settings');
var marketsRepository = require('../data-access/markets.repository');
var rewardRepository = require('../data-access/reward.repository');
var Decimal = require('decimal.js');

var co = require('co');
var qr = require('qr-image');
var { bitcoin, cryptoCompare, db } = require('../helpers');

//index
exports.index = (req,res) =>{
    co(function* (){
        let data = {
            ... yield bitcoin.getDifficulty(),
            hashrate : yield bitcoin.getHashRate(),
            connections : yield bitcoin.getConnections(),
            liteCoin : yield cryptoCompare.getLitecoin(),
            liteCoinPrice : yield cryptoCompare.getCoinPrice('LTC','USD'),
            coin : yield cryptoCompare.getCoin(),
            coinPrice : yield cryptoCompare.getCoinPrice('LYNX','LTC'),
            markets
        };
        data.usdPrice = data.liteCoinPrice * data.coinPrice;
        data.marketCap =  Number(data.coin.General.TotalCoinSupply) * data.usdPrice;
        res.render('explorer', data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });    
};

//latest-blocks
exports.latestBlocks = (req,res) =>{
    co(function* (){
        let data = {           
            coin : yield cryptoCompare.getCoin(),
            markets
        };
        res.render('latest-blocks', data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.block = (req,res) =>{    
    let hash = req.param('hash');
    co(function* (){
        let data = {
            coin : yield cryptoCompare.getCoin(),
            block : yield bitcoin.getBlockByHash(hash),
            markets
        };
        let txs = null;
        if(data.block !== bitcoin.CONSOLE_ERROR && hash === genesis_block){
            txs = 'GENESIS';
        }else{
            txs = yield db.tx.findByTxnIds(data.block.tx);            
        }
        data.block.difficultyToFixed = new Decimal(data.block.difficulty).toFixed(6);        
        res.render('block', {             
            ...data, 
            confirmations, 
            txs
        });
    }).catch(err=>{
        console.log(err);
    });

    // blockRepository.getBlock(hash).then(data=>{
    //     console.timeEnd(req.originalUrl);            
    //     if(data.txs.length>0){
    //         res.render('block', { 
    //             active: 'block', 
    //             ...data
    //         });
    //     }else{
    //         blockRepository.createTxs(data.block).then(data=>{                
    //             res.render('block', { 
    //                 active: 'block', 
    //                 ...data
    //             });
    //         });
    //     }
    // }).catch(err=>{
    //     handleError(res,err.message);
    // });
};

//address:hash
exports.address = (req,res) =>{
    let hash = req.param('hash');
    let count = req.param('count') || txcount;
    co(function* (){
        let data = {           
            coin : yield cryptoCompare.getCoin(),
            hash,
            markets
        };
        res.render('address', data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });    
};

//tx
exports.tx = (req,res) =>{
    let hash = req.param('txid');
    co(function* (){
        let coin = yield cryptoCompare.getCoin();
        let tx = yield db.tx.findOne(hash);
        if(tx){            
            let blockcount = yield bitcoin.getBlockCount();
            res.render('tx', {
                coin,
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
                        coin,
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
                        coin,                      
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
    }).catch(err=>{
        reject(err);
    });
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
    let { q: search } = req.query;    
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
        resolve(yield txn);
    }).catch(err=>{
        console.log('err',err);
    });
};

//richlist
exports.richList = (req,res) =>{
    co(function* (){
        let coin = yield cryptoCompare.getCoin();
        res.render('rich-list', {                
            coin,
            markets
        });
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.market = (req,res) =>{
    let { market } = req.params;   
    if (markets.enabled.indexOf(market) != -1) {
        co(function* (){
            let coin = yield cryptoCompare.getCoin();            
            res.render('markets_' + market, {                
                coin,
                markets,
                market
            });
        }).catch(err=>{
            res.status(500).send(err.message);
        });
    }else{
        res.redirect('/');
    }
};

exports.reward = (req,res) =>{    
    rewardRepository.getReward().then(data=>{        
        res.render('reward', { 
            active: 'reward', 
            ...data
        });
    }).catch(err=>{
        res.redirect('/');
    });
};

//network
exports.network = (req,res) =>{
    co(function* (){
        let data = {           
            coin : yield cryptoCompare.getCoin(),
            markets
        };
        res.render('network', data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

//api
exports.info = (req,res) =>{
    res.render('info', {       
        address: address, 
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