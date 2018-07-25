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
                address,
                txs
            });
        }else{
            throw new Error(hash+' not found');
        }
    }).catch(err=>{
        res.status(500).send(err);        
    });
};