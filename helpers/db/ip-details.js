var IpDetails = require('../../models/ip-details');

exports.findOne = (ip) => {
    return new Promise((resolve, reject) => {
        IpDetails.findOne({
            ip : ip
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.save = (model)=>{
    return new Promise((resolve,reject)=>{
        let ip = new IpDetails(model);
        ip.save(function(err) {
            if (err) reject(err);
            else resolve(ip);
        });
    });  
};