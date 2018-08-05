var axios = require('axios');
var settings = require('../lib/settings');

const BASE_URL = 'https://www.cryptocompare.com/api/';
//https://min-api.cryptocompare.com/data/top/exchanges/full?fsym=LYNX&tsym=LTC

exports.getCoin = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get(BASE_URL + 'data/coinsnapshotfullbyid?id=907677').then(res=>{            
            resolve(res.data.Data);
        }).catch(error=>reject(error));
    });    
};

exports.getLitecoin = ()=>{
    return new Promise((resolve,reject)=>{
        axios.get('https://min-api.cryptocompare.com/data/top/exchanges/full?fsym=LTC&tsym=USD').then(res=>{            
            resolve(res.data.Data);
        }).catch(error=>reject(error));
    });    
};

exports.getCoinPrice = (fromSymbol,toSymbol)=>{
    return new Promise((resolve,reject)=>{        
        axios.get('https://min-api.cryptocompare.com/data/price?fsym='+fromSymbol+'&tsyms='+toSymbol).then(res=>{            
            resolve(res.data[toSymbol]);
        }).catch(error=>reject(error));
    });    
};


