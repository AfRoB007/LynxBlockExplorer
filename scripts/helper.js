var fs = require('fs');
var co = require('co');
var helpers = require('../helpers');
var settings = require('../lib/settings');

module.exports.isLocked =(database) => {
    return new Promise(function (resolve) {
        if (database == 'index') {
            let fname = './tmp/' + database + '.pid';
            fs.exists(fname, function (exists) {
                resolve(exists);
            });
        } else {
            resolve(false);
        }
    });
};

module.exports.createLock =(database) => {
    return new Promise(function (resolve,reject) {
        if (database == 'index') {
            let fname = './tmp/' + database + '.pid';
            fs.appendFile(fname, process.pid, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(false);
        }
    });
};

module.exports.usage = () => {
    console.log('Usage: node scripts/sync.js [database] [mode]');
    console.log('');
    console.log('database: (required)');
    console.log('index [mode] Main index: coin info/stats, transactions & addresses');
    console.log('market       Market data: summaries, orderbooks, trade history & chartdata')
    console.log('');
    console.log('mode: (required for index database only)');
    console.log('update       Updates index from last sync to current block');
    console.log('check        checks index for (and adds) any missing transactions/addresses');
    console.log('reindex      Clears index then resyncs from genesis to current block');
    console.log('');
    console.log('notes:');
    console.log('* \'current block\' is the latest created block when script is executed.');
    console.log('* The market database only supports (& defaults to) reindex mode.');
    console.log('* If check mode finds missing data(ignoring new data since last sync),');
    console.log('  index_timeout in settings.json is set too low.')
    console.log('');
};