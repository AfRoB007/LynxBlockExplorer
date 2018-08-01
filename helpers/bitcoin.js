const axios = require('axios');
const settings = require('../lib/settings');
const address = require('./db/address');
const http = require('http');
const https = require('https');

const BASE_URL = 'http://'+settings.wallet.host+':' + settings.port + '/api/';

let axiosInstance = axios.create({
    baseURL : BASE_URL,
    timeout : 10 * 60 * 1000,
    proxy : false,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
});

const CONSOLE_ERROR = 'There was an error. Check your console.';

const handleError = (uri, message, resolve, reject)=>{
    return (err)=>{
        console.log(`${message} : ${uri} ==> ${err.message}`);
        if(err.message === CONSOLE_ERROR || err.code === 'ETIMEDOUT'){
            resolve(CONSOLE_ERROR);
        }else{
            console.log('handle err:',err);
            reject(err);            
        }
    };
};

const handleSuccess = (uri, message, resolve, reject)=>{
    return (res)=>{
        console.log(`${message} : ${uri}`);        
        let data = res.data;
        console.log(uri,':',data);
        if(data.name==='RpcError'){
            resolve(CONSOLE_ERROR);
        }else{
            resolve(data);          
        }
    };
};

exports.getDifficulty = ()=>{
    return new Promise((resolve,reject)=>{
        axiosInstance.get('/getdifficulty').then(res=>{
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
        axiosInstance.get('/getmininginfo').then(res=>{            
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
        axiosInstance.get('/getnetworkhashps').then(res=>{            
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
    let uri = '/getconnectioncount';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getConnections',resolve,reject))
        .catch(handleError(uri,'bitcoin:getConnections',resolve,reject));
    });    
};

exports.getBlockByHash = (hash)=>{
    let uri = '/getblock?hash='+hash;
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getBlockByHash',resolve,reject))
        .catch(handleError(uri,'bitcoin:getBlockByHash',resolve,reject));
    });
};

exports.getBlock = (height)=>{
    let uri = '/getblock?height='+height;
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getBlock',resolve,reject))
        .catch(handleError(uri,'bitcoin:getBlock',resolve,reject));
    });    
};

exports.getBlockCount = ()=>{
    let uri = '/getblockcount';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getBlockCount',resolve,reject))
        .catch(handleError(uri,'bitcoin:getBlockCount',resolve,reject));
    });    
};

exports.getBlockHash = (height)=>{
    let uri = '/getblockhash?height='+height;
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getBlockHash',resolve,reject))
        .catch(handleError(uri,'bitcoin:getBlockHash',resolve,reject));
    });    
};

exports.getRawTransaction = (hash)=>{
    let uri = '/getrawtransaction?txid=' + hash + '&decrypt=1';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getRawTransaction',resolve,reject))
        .catch(handleError(uri,'bitcoin:getRawTransaction',resolve,reject));
    });
};

exports.convertToSatoshi = (amount)=> {
    let fixed = amount.toFixed(8).toString(); 
    return parseInt(fixed.replace('.', ''));
};

exports.getMaxMoney = ()=>{
    let uri = '/getmaxmoney';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getMaxMoney',resolve,reject))
        .catch(handleError(uri,'bitcoin:getMaxMoney',resolve,reject));
    });
};

exports.getMaxVote = ()=>{
    let uri = '/getmaxvote';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getMaxVote',resolve,reject))     
        .catch(handleError(uri,'bitcoin:getMaxVote',resolve,reject));
    });
};

exports.getVote = ()=>{
    let uri = '/getvote';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getVote',resolve,reject))
        .catch(handleError(uri,'bitcoin:getVote',resolve,reject));
    });
};

exports.getPhase = ()=>{
    let uri = '/getphase';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getPhase',resolve,reject))
        .catch(handleError(uri,'bitcoin:getPhase',resolve,reject));
    });
};

exports.getReward = ()=>{
    let uri = '/getreward';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getReward',resolve,reject))      
        .catch(handleError(uri,'bitcoin:getReward',resolve,reject));
    });
};

exports.getEstNext = ()=>{
    let uri = '/getnextrewardestimate';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getEstNext',resolve,reject))
        .catch(handleError(uri,'bitcoin:getEstNext',resolve,reject));
    });
};

exports.getNextIn = ()=>{
    let uri = '/getnextrewardwhenstr';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,'bitcoin:getNextIn',resolve,reject))
        .catch(handleError(uri,'bitcoin:getNextIn',resolve,reject));
    });
};

exports.getSupply =()=>{
    return new Promise((resolve,reject)=>{
        let uri = '/getsupply';
        if(settings.supply == 'HEAVY'){
            uri = '/getsupply';
            axiosInstance.get(uri).then(res=>resolve(res.data)).catch(reject);
        }else if (settings.supply == 'GETINFO') {
            uri = '/getinfo';
            axiosInstance.get(uri).then(res=>resolve(res.data.moneysupply)).catch(reject);
        }else if (settings.supply == 'TXOUTSET') {
            uri = '/gettxoutsetinfo';
            axiosInstance.get(uri).then(res=>resolve(res.data.total_amount)).catch(reject);           
        }else if (settings.supply == 'BALANCES') {
            address.balanceSupply().then(resolve).catch(reject);   
        }
        address.coinBaseSupply().then(resolve).catch(reject);
    });
};

exports.CONSOLE_ERROR = CONSOLE_ERROR;