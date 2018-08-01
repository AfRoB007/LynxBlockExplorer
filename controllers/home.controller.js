var { display, movement, address, api, richlist, markets,
    genesis_tx, genesis_block, txcount, confirmations, txcount } = require('../lib/settings');
var repository = require('../data-access/richlist.repository');
var marketsRepository = require('../data-access/markets.repository');
var searchRepository = require('../data-access/search.repository');
var rewardRepository = require('../data-access/reward.repository');
var blockRepository = require('../data-access/block.repository');
var txRepository = require('../data-access/tx.repository');
var Decimal = require('decimal.js');

var co = require('co');
var qr = require('qr-image');
var { bitcoin, cryptoCompare, db } = require('../helpers');

const handleError = (res,error)=>{
    res.render('index', { 
        active: 'home', 
        error: error, 
        warning: null
    });
};

exports.index = (req,res) =>{
    co(function* (){
        let data = {
            liteCoinPrice : yield cryptoCompare.getCoinPrice('LTC','USD'),
            coin : yield cryptoCompare.getCoin(),
            coinPrice : yield cryptoCompare.getCoinPrice('LYNX','LTC')
        }
        data.usdPrice = data.liteCoinPrice * data.coinPrice;
        data.marketCap =  Number(data.coin.General.TotalCoinSupply) * data.usdPrice;
        res.render('index', {
            active: 'index',
            ...data
        });
    }).catch(err=>{
        console.log('home err',err);
    });    
};

exports.network = (req,res) =>{
    res.render('network', {
        active: 'network'
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

exports.info = (req,res) =>{
    res.render('info', { 
        active: 'info', 
        address: address, 
        hashes: api
    });
};

exports.richList = (req,res) =>{
    if (display.richlist){
        co(function* (){
            let coin = yield cryptoCompare.getCoin();
            res.render('rich-list', {
                active: 'explorer',
                coin
            });
        }).catch(err=>{
            res.status(500).send(err.message);
        });
    }else{
        res.redirect('/');
    }
};

exports.market = (req,res) =>{
    let { market } = req.params;   
    if (markets.enabled.indexOf(market) != -1) {
        console.time(req.originalUrl);
        marketsRepository.getMarkets(market).then(data=>{
            console.timeEnd(req.originalUrl);
            res.render('./markets/' + market, {
                active: 'markets',
                marketdata: {
                  coin: markets.coin,
                  exchange: markets.exchange,
                  data: data,
                },
                market: market
            });
        }).catch(err=>{
            res.redirect('/');
        });
    }else{
        res.redirect('/');
    }
};

// const searchAddress = (req,res)=>{
//     let { search } = req.body;
//     searchRepository.getAddress(search).then(address=>{
//         if (address) {
//             res.redirect('/address/' + address.a_id);
//         } else {
//             searchRepository.getBlockHash(search).then(hash=>{
//                 if (hash != 'There was an error. Check your console.') {
//                     res.redirect('/block/' + hash);
//                 } else {
//                     handleError(res,null);
//                 }
//             });
//         }
//     }).catch(err=>{
//         res.redirect('/');
//     });
// };

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
        console.log('hash',search,blockHash);
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

//search
exports.search1 = (req,res) =>{
    let { search } = req.body;
    if(search.length === 64){
        if(search === genesis_tx) {
            res.redirect('/block/' + genesis_block);
        }else{            
            searchRepository.findTransactionById(search).then(txn=>{
                if(txn){
                    res.redirect('/tx/' +txn.txid);
                }else{
                    searchRepository.getBlockHash(search).then(hash=>{
                        if (hash != 'There was an error. Check your console.') {
                            res.redirect('/block/' + hash);
                        } else {
                            handleError(res,locale.ex_search_error);
                        }
                    });
                }
            });
        }
    }else{
        searchAddress(req,res);
    }
};

//address:hash
exports.address = (req,res) =>{
    let hash = req.param('hash');
    let count = req.param('count') || txcount;
    co(function* (){
        let data = {           
            coin : yield cryptoCompare.getCoin()
        };
        res.render('address', {
            active: 'explorer',
            ...data,
            hash
        });
    }).catch(err=>{
        res.status(500).send(err.message);
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

exports.reward = (req,res) =>{
    console.time(req.originalUrl);
    rewardRepository.getReward().then(data=>{
        console.timeEnd(req.originalUrl);
        res.render('reward', { 
            active: 'reward', 
            ...data
        });
    }).catch(err=>{
        res.redirect('/');
    });
};

exports.block = (req,res) =>{
    console.time(req.originalUrl);
    let hash = req.param('hash');
    co(function* (){
        let block = yield bitcoin.getBlockByHash(hash);
        let txs = null;
        if(block !== bitcoin.CONSOLE_ERROR && hash === genesis_block){
            txs = 'GENESIS';
        }else{
            txs = yield db.tx.findByTxnIds(block.tx);            
        }
        block.difficultyToFixed = new Decimal(block.difficulty).toFixed(6);
        console.log('confirm',block.confirmations,confirmations);
        res.render('block', { 
            active: 'explorer', 
            block, 
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


exports.tx = (req,res) =>{
    console.time(req.originalUrl);
    let hash = req.param('txid');
    if(hash === genesis_tx){
        return res.redirect('/block/'+hash);
    }
    txRepository.getTx(hash).then(data=>{
        console.timeEnd(req.originalUrl);         
        res.render('tx', { 
            active: 'tx', 
            ...data
        });
    }).catch(err=>{
        handleError(res,err.message);
    });
};