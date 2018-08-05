var poloniex = require('./poloniex');
var bittrex = require('./bittrex');
var bleutrade = require('./bleutrade');
var cryptsy = require('./cryptsy');
var cryptopia = require('./cryptopia');
var yobit = require('./yobit');
var empoex = require('./empoex');
var ccex = require('./ccex');
var settings = require('../../lib/settings');

const getMarketData = (market, cb) => {
    return new Promise(function (resolve, reject) {
        switch (market) {
            case 'bittrex':
                bittrex.get_data(settings.markets.coin, settings.markets.exchange, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            case 'bleutrade':
                bleutrade.get_data(settings.markets.coin, settings.markets.exchange, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            case 'poloniex':
                poloniex.get_data(settings.markets.coin, settings.markets.exchange, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            case 'cryptsy':
                cryptsy.get_data(settings.markets.coin, settings.markets.exchange, settings.markets.cryptsy_id, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            case 'cryptopia':
                cryptopia.get_data(settings.markets.coin, settings.markets.exchange, settings.markets.cryptopia_id, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            case 'ccex':
                ccex.get_data(settings.markets.coin.toLowerCase(), settings.markets.exchange.toLowerCase(), settings.markets.ccex_key, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            case 'yobit':
                yobit.get_data(settings.markets.coin.toLowerCase(), settings.markets.exchange.toLowerCase(), function (err, obj) {
                    return cb(err, obj);
                });
                break;
            case 'empoex':
                empoex.get_data(settings.markets.coin, settings.markets.exchange, function (err, obj) {
                    if(err) reject(err);
                    else resolve(obj);
                });
                break;
            default:
                resolve(null);
        }
    });
};

exports.getMarketData = getMarketData;