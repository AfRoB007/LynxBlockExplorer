var Peers = require('../../models/peers');

exports.getPeers = (pageIndex, pageSize) => {
    return new Promise((resolve, reject) => {
        Peers
            .find({})
            .sort({
                _id: 'desc'
            })
            .skip((pageSize * pageIndex) - pageSize)
            .limit(pageSize)
            .exec(function (err, items) {
                if (err) reject(err);
                else resolve(items);
            });
    });
};

exports.getPeersCount = () => {
    return new Promise((resolve, reject) => {
        Peers.count({}).exec(function (err, count) {
            if (err) reject(err);
            else resolve(count);
        });
    });
};

exports.bulkInsert = (peers) => {
    return new Promise((resolve, reject) => {
        Peers.collection.insert(peers, function (err, items) {
            if (err) reject(err);
            else resolve(items);
        });
    });
};

exports.isAlreadyExist = (address) => {
    return new Promise((resolve, reject) => {
        Peers.findOne({
            address: address
        }, function (err, peer) {
            if (err) {
                reject(err);
            } else {
                resolve(peer !== null);
            }
        });
    });
};