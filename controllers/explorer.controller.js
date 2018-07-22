var repository = require('../data-access/explorer.repository');
var richListRepository = require('../data-access/richlist.repository');
var searchRepository = require('../data-access/search.repository');

var co = require('co');
var { bitcoin, cryptoCompare, db } = require('../helpers');

exports.index = (req,res) =>{
    co(function* (){
        let data = {
            ... yield bitcoin.getDifficulty(),
            hashrate : yield bitcoin.getHashRate(),
            connections : yield bitcoin.getConnections(),
            liteCoin : yield cryptoCompare.getLitecoin(),
            liteCoinPrice : yield cryptoCompare.getCoinPrice('LTC','USD'),
            coin : yield cryptoCompare.getCoin(),
            coinPrice : yield cryptoCompare.getCoinPrice('LYNX','LTC')
        };
        data.usdPrice = data.liteCoinPrice * data.coinPrice;
        data.marketCap =  Number(data.coin.General.TotalCoinSupply) * data.usdPrice;
        res.render('explorer', {
            active: 'explorer',
            ...data
        });
    }).catch(err=>{
        res.status(500).send(err.message);
    });   
};

exports.latestBlocks = (req,res) =>{
    co(function* (){
        let data = {           
            coin : yield cryptoCompare.getCoin()
        };
        res.render('latest-blocks', {
            active: 'explorer',
            ...data
        });
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.getLatestTransactions = (req,res) =>{    
    // let pageIndex = 1;
    // let pageSize = 10;
    // let min = 0.00000001;
    // if(req.query.pageIndex){
    //     pageIndex = parseInt(req.query.pageIndex);
    // }
    // if(req.query.pageSize){
    //     pageSize = parseInt(req.query.pageSize);
    // }
    co(function* (){
        let data = {
            ... yield bitcoin.getDifficulty()
        };
        data.latestTxns = [
            {"_id":"5b48e5e47d31604064f5a3d9","txid":"50ccd03665ea1a83654962c68c813c787eb461b4a79b4346028101e6f7826253","blockhash":"01ae618356e285c16f640551e07b2fe17957feebe10819ef7f0cacfffa4e7682","__v":0,"blockindex":2161553,"timestamp":1531503993,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e533866b02ec63907583","txid":"b234af47c7679da413ed7c7273587293af3d3a50d0fbd93ea0755ea4353f33c6","blockhash":"69fe3db0be69ce4853aec2fe531c22fa361382436282ce8bd22e4dd7b175f04d","__v":0,"blockindex":2161552,"timestamp":1531503862,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e532866b02ec63907582","txid":"0672dcfe62b872e6e7d54335cc00ed2362295ce4b4c9eb1a46c97a3adf9f6499","blockhash":"d3861aa8bcf9d70d5173beb2d4d357a43f93cf73273859862548e9d4fd4495ca","__v":0,"blockindex":2161551,"timestamp":1531503854,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e532866b02ec63907581","txid":"ca0ccdcb3c57d762b7932504a471e884bae755b69a41597acc664627dcf90eed","blockhash":"dc41d76bc9304b951bc2d6cad6803f6260812ac4ec6d8bbc1d588229328032ce","__v":0,"blockindex":2161550,"timestamp":1531503841,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e532866b02ec63907580","txid":"197308e3209ec97bdafec773c1dd079cfed4a085423502dfcddd7626f38bd1af","blockhash":"9194bfecdc8f9a3bdbc9129ca3f453bc6a40b436b3b2cf9e2d044bd27e042cd6","__v":0,"blockindex":2161549,"timestamp":1531503783,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e532866b02ec6390757f","txid":"76742696486cfeff863d7f0be86e761a9899353d00544624a3e52024670ee889","blockhash":"2c8ba5a8ff03a2f1114ec492a8287d5657f11149839409197b6ffac9e0242944","__v":0,"blockindex":2161548,"timestamp":1531503772,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e532866b02ec6390757e","txid":"7f21e15ab50019d07bb175c2c30acaacd1fa1d5f36eadb3ee85ae7e1676e4c64","blockhash":"659e16d3df6f9eba0dfc85186ca16c2aa4347368da6af02ff2a834357cb2a7cd","__v":0,"blockindex":2161547,"timestamp":1531503760,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e47bd7a3ac9b63013e80","txid":"89fd2b70afc6501da33db24a69440dfe506df407c11253d3e0d914f2f60f1c47","blockhash":"21334b1eb4fd4235283eb7a758cd8b9a9b1cd5760b6101b4e77dff48889dd071","__v":0,"blockindex":2161546,"timestamp":1531503636,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48e313f9fa9d0d633fc676","txid":"b56ac2d0405f2d90bf2c9bb3f15fc443f8fc710a1fecc638934d8a8672c3aa47","blockhash":"344186e16a4ac1d37b3a29fd72787576268eb722c0da91e6c8e0cb29868e259f","__v":0,"blockindex":2161545,"timestamp":1531503219,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48d9eec3369b255f8ed9a9","txid":"a2c5e2fcd35b89921a1694c502222b0c925e949d23aa5cdd3092966b4f70e6e1","blockhash":"2b1b5365c26e43f073365e876ac20997a9117afddb59e860363c9d5a7f8d3584","__v":0,"blockindex":2161488,"timestamp":1531500939,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]},
            {"_id":"5b48d9eec3369b255f8ed9a8","txid":"48ac0d47c9c3654e89a7331da62ef88c49de1fda8e13031b49af7187153b60cf","blockhash":"8f7c0ac1d231fa3225df13a39eea0be0be4e2a102f584faef73184909bba5633","__v":0,"blockindex":2161487,"timestamp":1531500895,"total":100000000,"vout":[{"addresses":"KT5kYQXjvubU2F7cHWtNdfe9LPPyJX1dKp","amount":100000000}],"vin":[{"addresses":"coinbase","amount":100000000}]}        
        ];
        res.send(data);
    }).catch(err=>{
        res.status(500).send(err.message);
    }); 
    // repository.getLastTransactions(min,pageIndex,pageSize).then(data=>{
    //     console.timeEnd(req.originalUrl);
    //     console.log('data',data);
    //     res.render('latest-blocks', {
    //         active: 'explorer',
    //         ...data
    //     });
    // }).catch(err=>{
    //     res.status(500).send(err.message);
    // });
};

exports.getSummary = (req,res) =>{
    console.time(req.originalUrl);
    repository.getSummary().then(summary=>{
        console.timeEnd(req.originalUrl);
        res.send({
            data:[summary]
        });
    }).catch(err=>{
        console.log(err.message);
        res.status(500).send(err.message);
    });
};

exports.getLastTransactions = (req,res) =>{
    console.time(req.originalUrl);
    let pageIndex = 1;
    let pageSize = 10;
    if(req.query.pageIndex){
        pageIndex = parseInt(req.query.pageIndex);
    }
    if(req.query.pageSize){
        pageSize = parseInt(req.query.pageSize);
    }

    repository.getLastTransactions(req.params.min,pageIndex,pageSize).then(data=>{
        console.timeEnd(req.originalUrl);
        res.send(data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.getPeerConnections = (req,res) =>{
    console.time(req.originalUrl);
    let pageIndex = 1;
    let pageSize = 10;
    if(req.query.pageIndex){
        pageIndex = parseInt(req.query.pageIndex);
    }
    if(req.query.pageSize){
        pageSize = parseInt(req.query.pageSize);
    }
    repository.getPeerConnections(pageIndex,pageSize).then(data=>{
        console.timeEnd(req.originalUrl);
        res.send(data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.getDistribution = (req,res) =>{
    console.time(req.originalUrl);
    richListRepository.getDistribution().then(distribution=>{
        console.timeEnd(req.originalUrl);
        res.send(distribution);
    }).catch(err=>{
        res.send(err);
    });
};

exports.getAddress = (req,res) =>{
    let hash = req.param('hash');
    searchRepository.getAddress(hash).then(address=>{
        if (address) {
            let a_ext = {
              address: address.a_id,
              sent: (address.sent / 100000000),
              received: (address.received / 100000000),
              balance: (address.balance / 100000000).toString().replace(/(^-+)/mg, ''),
              last_txs: address.txs,
            };
            res.send(a_ext);
        } else {
            res.send({ 
                error: 'address not found.', 
                hash
            });
        }
    }).catch(err=>{
        res.send({ 
            error: 'address not found.', 
            hash
        });
    });
};

exports.getBalance = (req,res) =>{
    let hash = req.param('hash');
    searchRepository.getAddress(hash).then(address=>{
        if (address) {
            res.send((address.balance / 100000000).toString().replace(/(^-+)/mg, ''));           
        } else {
            res.send({ 
                error: 'address not found.', 
                hash
            });
        }
    }).catch(err=>{
        res.send({ 
            error: 'address not found.', 
            hash
        });
    });
};