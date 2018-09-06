var axios = require('axios');
const http = require('http');
const https = require('https');
var settings = require('../lib/settings');

const BASE_URL = 'https://www.cryptocompare.com/api/';

let axiosInstance = axios.create({
    timeout : 10 * 60 * 1000,
    proxy : false,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
});

exports.getCoin = ()=>{
    return new Promise((resolve,reject)=>{
        axiosInstance.get(BASE_URL + 'data/coinsnapshotfullbyid?id=907677').then(res=>{            
            resolve(res.data.Data);
        }).catch(reject);
    });    
};

exports.getLitecoin = ()=>{
    return new Promise((resolve,reject)=>{
        axiosInstance.get('https://min-api.cryptocompare.com/data/top/exchanges/full?fsym=LTC&tsym=USD').then(res=>{            
            resolve(res.data.Data);
        }).catch(reject);
    });    
};

exports.getCoinPrice = (fromSymbol,toSymbol)=>{
    return new Promise((resolve,reject)=>{        
        axiosInstance.get('https://min-api.cryptocompare.com/data/price?fsym='+fromSymbol+'&tsyms='+toSymbol).then(res=>{            
            resolve(res.data[toSymbol]);
        }).catch(reject);
    });    
};
