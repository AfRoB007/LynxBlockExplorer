var Address = require('../../models/address')
var { coin } = require('../../lib/settings');

exports.findAddress = (hash)=>{
    return Address.findOne({ a_id: hash });    
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


