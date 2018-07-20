var repository = require('../data-access/explorer.repository');
var richListRepository = require('../data-access/richlist.repository');
var searchRepository = require('../data-access/search.repository');
var logger = require('winston');

exports.getSummary = (req,res) =>{
    repository.getSummary().then(summary=>{        
        logger.info(summary);
        res.send({
            data:[summary]
        });
    }).catch(err=>{
        logger.error(err);        
        res.status(500).send(err);
    });
};

exports.getLastTransactions = (req,res) =>{
    let pageIndex = 1;
    let pageSize = 10;
    if(req.query.pageIndex){
        pageIndex = parseInt(req.query.pageIndex);
    }
    if(req.query.pageSize){
        pageSize = parseInt(req.query.pageSize);
    }

    repository.getLastTransactions(req.params.min,pageIndex,pageSize).then(data=>{        
        res.send(data);
    }).catch(err=>{
        console.log('getLastTransactions',err);
        res.status(500).send(err);
    });
};

exports.getPeerConnections = (req,res) =>{
    let pageIndex = 1;
    let pageSize = 10;
    if(req.query.pageIndex){
        pageIndex = parseInt(req.query.pageIndex);
    }
    if(req.query.pageSize){
        pageSize = parseInt(req.query.pageSize);
    }
    repository.getPeerConnections(pageIndex,pageSize).then(data=>{
        res.send(data);
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.getDistribution = (req,res) =>{
    richListRepository.getDistribution().then(distribution=>{        
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