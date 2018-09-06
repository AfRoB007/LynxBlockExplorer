var axios = require('axios');
const http = require('http');
const https = require('https');
const { JSDOM } = require("jsdom");

const BASE_URL = 'https://coinmarketcap.com/currencies/lynx';

let axiosInstance = axios.create({
    timeout : 10 * 60 * 1000,
    proxy : false,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
});

exports.get24HoursVolume = ()=>{
    return new Promise((resolve,reject)=>{
        axiosInstance.get(BASE_URL).then(res=>{
            let { document } = new JSDOM(res.data).window     
            let span = document.querySelector('span[data-currency-volume]>span');
            if(span){
                resolve(Number(span.textContent));
            }else{
                resolve('Error in console');
            }
        }).catch(reject);
    });    
};