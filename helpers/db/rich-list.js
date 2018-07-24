var Richlist = require('../../models/richlist');
var Address = require('../../models/address');
var { coin } = require('../../lib/settings');

exports.getRichList = ()=>{
    return Richlist.findOne({ coin });
};

exports.update = (model)=>{
    return new Promise((resolve,reject)=>{
        Richlist.update({ coin: coin}, model, function(err,richlist) {
            if(err) reject(err);
            else resolve(richlist);
        });
    });
};

exports.updateReceivedRichlist =()=>{
    return new Promise((resolve,reject)=>{
        Address
        .find({})
        .sort({
            received: 'desc'
        })
        .limit(100)
        .exec(function(err, addresses){
            if (err) reject(err);
            else{
                Richlist.update({ coin }, {
                    received: addresses,
                }, function(err, result) {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};

exports.updateBalanceRichlist =()=>{
    return new Promise((resolve,reject)=>{
        Address
        .find({})
        .sort({
            balance: 'desc'
        })
        .limit(100)
        .exec(function(err, addresses){
            if (err) reject(err);
            else{
                Richlist.update({ coin }, {
                    balance: addresses,
                }, function(err, result) {
                    if (err) reject(err);
                    else resolve(result);
                });
            }
        });
    });
};