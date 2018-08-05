var Address = require('../../models/address');
var { coin } = require('../../lib/settings');

exports.findOne = (hash)=>{
    return new Promise((resolve,reject)=>{
        Address.findOne({ a_id: hash },function(err,address) {
            if (err) reject(err);
            else resolve(address);
        });
    });
};

exports.save = (model)=>{
    return new Promise((resolve,reject)=>{
        let address = new Address(model);
        address.save(function(err) {
            if (err) reject(err);
            else resolve(address);
        });
    });  
};

exports.update = (hash, model)=>{
    return new Promise((resolve,reject)=>{
        Address.update({a_id:hash}, model, function(err,data) {
            if (err) reject(err);
            else resolve(data);
        });
    });  
};

exports.balanceSupply = () => {
    return new Promise((resolve, reject) => {
        Address.find({}, 'balance').where('balance').gt(0).exec(function (err, docs) {
            let count = docs.reduce((a,b)=> a.balance + b.balance, 0);
            resolve(count/100000000);
        });
    });
};

exports.coinBaseSupply = () => {
    return new Promise((resolve) => {
        Address.findOne({
            a_id: 'coinbase'
        }, function (err, address) {
            if (address) {
                resolve(address.sent/100000000);
            } else {
                resolve(0);
            }
        });
    });
};

exports.removeAll = () => {
    return new Promise((resolve) => {
        Address.remove({}, function (err, result) {
            if(err) reject(err);
            else resolve(result);
        });
    });
};