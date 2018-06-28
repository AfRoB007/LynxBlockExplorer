var co = require('co');
var { db, bitcoin, lib } = require('../helpers');
var { genesis_block, confirmations, txcount } = require('../lib/settings');

exports.getTx = (hash)=>{
    return new Promise((resolve,reject)=>{
        co(function* (){
            let tx = yield db.tx.findOne(hash);
            if(tx){
                let blockcount = yield bitcoin.getBlockCount();
                resolve({ tx, confirmations, blockcount });  
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
                        resolve({ tx: utx, confirmations, blockcount:-1 });
                    }else{
                        utx.blockhash = rtx.blockhash;
                        utx.blockindex =  rtx.blockheight;
                        
                        let blockcount = yield bitcoin.getBlockCount();
                        resolve({ tx: utx, confirmations, blockcount });
                    }
                }else{
                    reject(new Error('Txn not found '+hash));
                }
            }
        }).catch(err=>{
            reject(err);
        });
    });    
};