var Address = require('../../models/address')
var { coin } = require('../../lib/settings');

exports.findAddress = (hash)=>{
    return Address.findOne({ a_id: hash });    
};