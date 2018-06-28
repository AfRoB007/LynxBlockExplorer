var Richlist = require('../../models/richlist');
var { coin } = require('../../lib/settings');

exports.getRichList = ()=>{
    return Richlist.findOne({ coin });
};