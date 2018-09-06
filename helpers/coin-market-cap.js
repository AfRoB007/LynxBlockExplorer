var axios = require('axios');
const http = require('http');
const https = require('https');

const BASE_URL = 'https://api.coinmarketcap.com';

let axiosInstance = axios.create({
    timeout : 10 * 60 * 1000,
    proxy : false,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
});

exports.get24HoursVolume = ()=>{
    return new Promise((resolve,reject)=>{
        axiosInstance.get(BASE_URL+'/v2/ticker/3099').then(res=>{
            let { data } = res.data;
            resolve(data.quotes.USD.volume_24h);
        }).catch(reject);
    });    
};