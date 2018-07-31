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
        if(yield helper.isLocked()){
            console.log("Script already running ...");
        }else{
            console.log('-----------------------------------');
            console.log('mode:'+mode,'database:'+database);
            if(yield helper.createLock()){
                console.log('lock created');                
                if(database==='index'){
                    let stats = yield common.updateDb(settings.coin);                    
                    if(stats){
                        if (settings.heavy) {
                            // update heavy stats for coin
                            console.log('updating heavy');
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
                            console.log('check start ...',stats.count);                            
                            let newStats = yield common.updateTxnsDb(1, stats.count);
                            console.log('check complete (block: %s)', newStats.last);
                        }else if (mode == 'update'){                            
                            let newStats = yield common.updateTxnsDb(stats.last,  stats.count);
                            yield helpers.db.richlist.updateReceivedRichlist();
                            yield helpers.db.richlist.updateBalanceRichlist();
                            console.log('check complete (block: %s)', newStats.last);
                        }
                    }else{
                        throw new Error('Run \'npm start\' to create database structures before running this script.');
                    }                 
                }else{
                    //update markets
                    let markets = settings.markets.enabled;
                    let marketsLength = markets.length;                   
                    for (let index = 0; index < marketsLength; index++) {
                        let market = markets[index];
                        let isAlreadyExist = yield helpers.db.markets.isAlreadyExist(market);
                        if(isAlreadyExist){
                            yield common.updateMarketsDb(market);
                            console.log('markets db updated for %s',market);
                        }else{
                            console.log('error: entry for %s does not exists in markets db.', market);
                        }
                    }
                }
            }
        }
        helpers.disconnect();
        process.exit(0);
    }).catch(err => {
        console.log('Aborting:', err.message);
        helpers.disconnect();
        helper.removeLock().then(()=>{
            console.log('lock removed');
        });
        process.exit(1);
    });
});
