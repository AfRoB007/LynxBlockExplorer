var axios = require('axios');
var settings = require('../lib/settings');

//const BASE_URL = 'http://127.0.0.1:' + settings.port + '/api/';
const BASE_URL = 'http://seed06.getlynx.io/api/';

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
        axios.get(BASE_URL + 'getconnectioncount').then(res=>resolve(res.data)).catch(error=>reject(error));
    });    
};

exports.getBlock = (height)=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblock?height='+height).then(res=>resolve(res.data)).catch(error=>reject(error));
    });    
};

exports.getBlockCount = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblockcount').then(res=>resolve(res.data)).catch(error=>reject(error));
    });    
};

exports.getBlockHash = (height)=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'getblockhash?height='+height).then(res=>resolve(res.data)).catch(error=>reject(error));
    });    
};