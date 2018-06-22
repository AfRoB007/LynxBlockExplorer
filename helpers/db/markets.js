var Markets = require('../../models/markets');

exports.getMarkets = (market)=>{
    return Markets.findOne({ market });
};