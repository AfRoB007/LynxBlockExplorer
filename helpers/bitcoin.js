var axios = require('axios');
var settings = require('../lib/settings');
var address = require('./db/address');

//const BASE_URL = 'http://127.0.0.1:' + settings.port + '/api/';
const BASE_URL = 'http://seed00.getlynx.io/api/';
const CONSOLE_ERROR = 'There was an error. Check your console.';

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
        }).catch(error=>reject(error));
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
        }).catch(error=>reject(error));
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
        }).catch(error=>reject(error));
    });
};

exports.getHashRate = ()=>{
    let { index } = settings;
    if (index.show_hashrate == false) return Promise.resolve('-');    
    if (settings.nethash == 'netmhashps') return getHashRateFromMiningInfo();
    return getHashRateFromNetwork();
};

exports.getConnections = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getconnectioncount').then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });    
};

exports.getBlockByHash = (hash)=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblock?hash='+hash).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getBlock = (height)=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblock?height='+height).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });    
};

exports.getBlockCount = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblockcount').then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });    
};

exports.getBlockHash = (height)=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblockhash?height='+height).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });    
};

exports.getRawTransaction = (hash)=>{
    let uri = BASE_URL + 'getrawtransaction?txid=' + hash + '&decrypt=1';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
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
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getMaxVote = ()=>{
    let uri = BASE_URL + 'getmaxvote';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getVote = ()=>{
    let uri = BASE_URL + 'getvote';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getPhase = ()=>{
    let uri = BASE_URL + 'getphase';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getReward = ()=>{
    let uri = BASE_URL + 'getreward';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getEstNext = ()=>{
    let uri = BASE_URL + 'getnextrewardestimate';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
    });
};

exports.getNextIn = ()=>{
    let uri = BASE_URL + 'getnextrewardwhenstr';
    return new Promise((resolve,reject)=>{
        axios.get(uri).then(res=>resolve(res.data))
        .catch(err=>{
            console.log(err.message);
            resolve(CONSOLE_ERROR);
        });
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