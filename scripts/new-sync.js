var settings = require('../lib/settings');
var helpers = require('../helpers');
var common = require('../helpers/common');
var helper = require('./helper');
var co = require('co');

var mode = 'update';
var database = 'index';

// check options
if (process.argv[2] == 'index') {
    if (process.argv.length < 3) {
        helper.usage();
    } else {
        switch (process.argv[3]) {
            case 'update':
                mode = 'update';
                break;
            case 'check':
                mode = 'check';
                break;
            case 'reindex':
                mode = 'reindex';
                break;
            default:
            helper.usage();
        }
    }
} else if (process.argv[2] == 'market') {
    database = 'market';
} else {
    helper.usage();
}

helpers.connect(function () {
    co(function* () {
        if(yield helper.isLocked(database)){
            console.log("Script already running ...");
        }else{
            if(yield helper.createLock(database)){                
                if(database==='index'){
                    let stats = yield common.updateDb(settings.coin);
                    console.log('update db done',mode,stats);
                    if(stats){
                        if (settings.heavy) {
                            // update heavy stats for coin
                            let result = yield common.updateHeavy(stats.count, 20);
                        }
                        if (mode == 'reindex') {
                            yield helpers.db.tx.removeAll();
                            yield helpers.db.address.removeAll();
                            yield helpers.db.richlist.update({
                                received: [],
                                balance: [],
                            });
                            yield helpers.db.coinStats.update({
                                last: 0
                            });
                            console.log('index cleared (reindex)');
                            let newStats = yield common.updateTxnsDb(1,  stats.count);
                            yield helpers.db.richlist.updateReceivedRichlist();
                            yield helpers.db.richlist.updateBalanceRichlist();
                            console.log('reindex complete (block: %s)', newStats.last);

                        }else if (mode == 'check'){
                            let newStats = yield common.updateTxnsDb(1,  stats.count);
                            console.log('check complete (block: %s)', newStats.last);
                        }else if (mode == 'update'){
                            let newStats = yield common.updateTxnsDb(stats.last,  stats.count);
                            yield helpers.db.richlist.updateReceivedRichlist();
                            yield helpers.db.richlist.updateBalanceRichlist();
                            console.log('check complete (block: %s)', newStats.last);
                        }
                    }else{
                        console.log('Run \'npm start\' to create database structures before running this script.');
                    }                 
                }else{
                    console.log('update markets');
                }
            }
        }
        process.exit(0);
    }).catch(err => {
        console.log('Aborting:', err.message);
        console.log('Aborting:', err);
        helper.removeLock()
        .then(()=>{
            process.exit(1);
        }).catch(err=>{
            console.log('Unable to remove lock:', err.message);
            process.exit(1);
        });        
    });
});
