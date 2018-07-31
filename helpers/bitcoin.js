var axios = require('axios');
var settings = require('../lib/settings');
var address = require('./db/address');

const BASE_URL = 'http://127.0.0.1:' + settings.port + '/api/';
//const BASE_URL = 'http://173.255.205.35/api/';

const CONSOLE_ERROR = 'There was an error. Check your console.';

const handleError = (uri, message, resolve, reject)=>{
    return (err)=>{
        console.log(`${message} : ${uri} ==> ${err.message}`);
        if(err.message === CONSOLE_ERROR){
            resolve(CONSOLE_ERROR);
        }else{
            reject(err);
        }
    };
};

exports.getDifficulty = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getdifficulty').then(res=>{
            let difficulty = res.data;
            let difficultyHybrid = ''
            let { index } = settings;
            if (difficulty['proof-of-work']) {
                if (index.difficulty == 'Hybrid') {
                    difficultyHybrid = 'POS: ' + difficulty['proof-of-stake'];
                    difficulty = 'POW: ' + difficulty['proof-of-work'];
                } else if (index.difficulty == 'POW') {
                    difficulty = difficulty['proof-of-work'];
                } else {
                    difficulty = difficulty['proof-of-stake'];
                }
            }
            resolve({
                difficulty,
                difficultyHybrid
            });
        }).catch(reject);
    });
};

const getHashRateFromMiningInfo =()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getmininginfo').then(res=>{            
            let { netmhashps } = res.data;
            let { nethash_units } = settings;
            let hashRate = '-';
            
            if(netmhashps){
                if (nethash_units == 'K') {                    
                    hashRate = (netmhashps * 1000).toFixed(4);
                } else if (nethash_units == 'G') {
                    hashRate = (netmhashps / 1000).toFixed(4);
                } else if (nethash_units == 'H') {
                    hashRate = (netmhashps * 1000000).toFixed(4);
                } else if (settings.nethash_units == 'T') {
                    hashRate = (netmhashps / 1000000).toFixed(4);
                } else if (settings.nethash_units == 'P') {
                    hashRate = (netmhashps / 1000000000).toFixed(4);
                } else {
                    hashRate = netmhashps.toFixed(4);
                }
            }
            resolve(hashRate);
        }).catch(reject);
    });
};

const getHashRateFromNetwork =()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getnetworkhashps').then(res=>{            
            let netmhashps = res.data;
            let { nethash_units } = settings;
            let hashRate;
            if(netmhashps==='There was an error. Check your console.'){
                hashRate = '-';
            }
            else if (nethash_units == 'K') {
                hashRate = (netmhashps / 1000).toFixed(4);
            } else if (nethash_units == 'M'){
                hashRate = (netmhashps / 1000000).toFixed(4);
            } else if (nethash_units == 'G') {
                hashRate = (netmhashps / 1000000000).toFixed(4);
            } else if (nethash_units == 'T') {
                hashRate = (netmhashps / 1000000000000).toFixed(4);
            } else if (nethash_units == 'P') {
                hashRate = (netmhashps / 1000000000000000).toFixed(4);
            } else {
                hashRate = (netmhashps).toFixed(4);
            }
            resolve(hashRate);
        }).catch(reject);
    });
};

exports.getHashRate = ()=>{
    let { index } = settings;
    if (index.show_hashrate == false) return Promise.resolve('-');    
    if (settings.nethash == 'netmhashps') return getHashRateFromMiningInfo();
    return getHashRateFromNetwork();
};

exports.getConnections = ()=>{
    let uri = BASE_URL + 'getconnectioncount';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getConnections',resolve,reject));
    });    
};

exports.getBlockByHash = (hash)=>{
    let uri = BASE_URL + 'getblock?hash='+hash;
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getBlockByHash',resolve,reject));
    });
};

exports.getBlock = (height)=>{
    let uri = BASE_URL + 'getblock?height='+height;
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getBlock',resolve,reject));
    });    
};

exports.getBlockCount = ()=>{
    let uri = BASE_URL + 'getblockcount';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getBlockCount',resolve,reject));
    });    
};

exports.getBlockHash = (height)=>{
    let uri = BASE_URL + 'getblockhash?height='+height;
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getBlockHash',resolve,reject));
    });    
};

exports.getRawTransaction = (hash)=>{
    let uri = BASE_URL + 'getrawtransaction?txid=' + hash + '&decrypt=1';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getRawTransaction',resolve,reject));
    });
};

exports.convertToSatoshi = (amount)=> {
    let fixed = amount.toFixed(8).toString(); 
    return parseInt(fixed.replace('.', ''));
};

exports.getMaxMoney = ()=>{
    let uri = BASE_URL + 'getmaxmoney';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getMaxMoney',resolve,reject));
    });
};

exports.getMaxVote = ()=>{
    let uri = BASE_URL + 'getmaxvote';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getMaxVote',resolve,reject));
    });
};

exports.getVote = ()=>{
    let uri = BASE_URL + 'getvote';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getVote',resolve,reject));
    });
};

exports.getPhase = ()=>{
    let uri = BASE_URL + 'getphase';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getPhase',resolve,reject));
    });
};

exports.getReward = ()=>{
    let uri = BASE_URL + 'getreward';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getReward',resolve,reject));
    });
};

exports.getEstNext = ()=>{
    let uri = BASE_URL + 'getnextrewardestimate';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getEstNext',resolve,reject));
    });
};

exports.getNextIn = ()=>{
    let uri = BASE_URL + 'getnextrewardwhenstr';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(handleError(uri,'bitcoin:getNextIn',resolve,reject));
    });
};

exports.getSupply =()=>{
    return new Promise((resolve,reject)=>{
        let uri = BASE_URL + 'getsupply';
        if(settings.supply == 'HEAVY'){
            uri = BASE_URL + 'getsupply';
            axios.get(uri).then(res=>resolve(res.data)).catch(reject);
        }else if (settings.supply == 'GETINFO') {
            uri = BASE_URL + 'getinfo';
            axios.get(uri).then(res=>resolve(res.data.moneysupply)).catch(reject);
        }else if (settings.supply == 'TXOUTSET') {
            uri = BASE_URL + 'gettxoutsetinfo';
            axios.get(uri).then(res=>resolve(res.data.total_amount)).catch(reject);           
        }else if (settings.supply == 'BALANCES') {
            address.balanceSupply().then(resolve).catch(reject);   
        }
        address.coinBaseSupply().then(resolve).catch(reject);
    });
};

exports.CONSOLE_ERROR = CONSOLE_ERROR;