var Peers = require('../../models/peers');

exports.getPeers = ()=>{
    return Peers.find({});
};