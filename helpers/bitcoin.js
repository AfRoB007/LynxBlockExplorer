const axios = require('axios');
const settings = require('../lib/settings');
const address = require('./db/address');
const http = require('http');
const https = require('https');
const Decimal = require('decimal.js');

const BASE_URL = 'http://'+settings.wallet.host+':' + settings.port + '/api/';

let axiosInstance = axios.create({
    baseURL : BASE_URL,
    //timeout : 10 * 60 * 1000,
    timeout : 30 * 1000,
    proxy : false,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
});

const CONSOLE_ERROR = 'There was an error. Check your console.';

const handleError = (uri, resolve, reject)=>{
    return (err)=>{
        console.log(`${uri} : ${err.message}`);
        let status = null;
        if(err.response){
            status = err.response.status;
        }
        if(err.code === 'ECONNRESET'){
            resolve(CONSOLE_ERROR);
        }else if(err.code === 'ETIMEDOUT'){
            resolve(CONSOLE_ERROR);
        }        
        else if(status === null || err.message === CONSOLE_ERROR){
            resolve(CONSOLE_ERROR);
        }        
        else if(status && status === 404){
            return reject(new Error(`${BASE_URL}${uri} not found`));
        }else{
            console.log('reject', err.code);
            reject(err);            
        }
    };
};

const handleSuccess = (uri, resolve, reject)=>{
    return (res)=>{        
        let data = res.data;        
        if(data.name==='RpcError'){
            resolve(CONSOLE_ERROR);
        }else{
            resolve(data);          
        }
    };
};

exports.getDifficulty = ()=>{
    return new Promise((resolve,reject)=>{
        let uri = 'getdifficulty';
        axiosInstance.get(uri).then(res=>{
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
            let difficultyToFixed = 0;
            if(difficulty !== CONSOLE_ERROR){
                difficultyToFixed = new Decimal(difficulty).toFixed(6);
            }
            resolve({
                difficulty,
                difficultyHybrid,
                difficultyToFixed
            });
        }).catch(handleError(uri,resolve,reject));
    });
};

const getHashRateFromMiningInfo =()=>{
    return new Promise((resolve,reject)=>{
        let uri = 'getmininginfo';
        axiosInstance.get(uri).then(res=>{            
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
        }).catch(handleError(uri,resolve,reject));
    });
};

const getHashRateFromNetwork =()=>{
    return new Promise((resolve,reject)=>{
        let uri = 'getnetworkhashps';
        axiosInstance.get(uri).then(res=>{            
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
        }).catch(handleError(uri,resolve,reject));
    });
};

exports.getHashRate = ()=>{
    let { index } = settings;
    if (index.show_hashrate == false) return Promise.resolve('-');    
    if (settings.nethash == 'netmhashps') return getHashRateFromMiningInfo();
    return getHashRateFromNetwork();
};

exports.getConnections = ()=>{
    let uri = 'getconnectioncount';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });    
};

exports.getBlockByHash = (hash)=>{
    let uri = 'getblock?hash='+hash;
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getBlock = (height)=>{
    let uri = 'getblock?height='+height;
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });    
};

exports.getBlockCount = ()=>{
    let uri = 'getblockcount';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });    
};

exports.getBlockHash = (height)=>{
    let uri = 'getblockhash?height='+height;
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });    
};

exports.getRawTransaction = (hash)=>{
    let uri = 'getrawtransaction?txid=' + hash + '&decrypt=1';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.convertToSatoshi = (amount)=> {
    let fixed = amount.toFixed(8).toString(); 
    return parseInt(fixed.replace('.', ''));
};

exports.getMaxMoney = ()=>{
    let uri = 'getmaxmoney';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getMaxVote = ()=>{
    let uri = 'getmaxvote';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))     
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getVote = ()=>{
    let uri = 'getvote';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getPhase = ()=>{
    let uri = 'getphase';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getReward = ()=>{
    let uri = 'getreward';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))      
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getEstNext = ()=>{
    let uri = 'getnextrewardestimate';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getNextIn = ()=>{
    let uri = 'getnextrewardwhenstr';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getMemPoolInfo = ()=>{
    let uri = 'getmempoolinfo';
    return new Promise((resolve,reject)=>{
        axiosInstance.get(uri)
        .then(handleSuccess(uri,resolve,reject))
        .catch(handleError(uri,resolve,reject));
    });
};

exports.getSupply =()=>{
    return new Promise((resolve,reject)=>{
        let uri = 'getsupply';
        if(settings.supply == 'HEAVY'){
            uri = 'getsupply';
            axiosInstance.get(uri).then(res=>resolve(res.data)).catch(reject);
        }else if (settings.supply == 'GETINFO') {
            uri = 'getinfo';
            axiosInstance.get(uri).then(res=>resolve(res.data.moneysupply)).catch(reject);
        }else if (settings.supply == 'TXOUTSET') {
            uri = 'gettxoutsetinfo';
            axiosInstance.get(uri).then(res=>resolve(res.data.total_amount)).catch(reject);           
        }else if (settings.supply == 'BALANCES') {
            address.balanceSupply().then(resolve).catch(reject);   
        }
        address.coinBaseSupply().then(resolve).catch(reject);
    });
};

exports.CONSOLE_ERROR = CONSOLE_ERROR;