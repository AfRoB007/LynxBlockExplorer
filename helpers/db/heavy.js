var Heavy = require('../../models/heavy');
var { coin } = require('../../lib/settings');

exports.getHeavy = ()=>{
    return new Promise((resolve,reject)=>{
        Heavy.findOne({ coin }, (err,data)=>{
            if(err) reject(err);
            else resolve(data);
        });
    });
};

exports.update = (model)=>{
    return new Promise((resolve,reject)=>{
        Heavy.update({coin: coin}, model, function(err,heavy) {
            if(err) reject(err);
            else resolve(heavy);
        });
    });
};