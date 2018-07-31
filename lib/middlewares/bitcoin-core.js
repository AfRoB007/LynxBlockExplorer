var Client = require('bitcoin-core');
var express = require('express');

let wallet_passphrase = null;
let accesslist = {
    type : 'all'
};
let client = null;
const requires_passphrase = {
    'dumpprivkey': true,
    'importprivkey': true,
    'keypoolrefill': true,
    'sendfrom': true,
    'sendmany': true,
    'sendtoaddress': true,
    'signmessage': true,
    'signrawtransaction': true
};

const setAccess = (type, access_list) => {
    //Reset//
    accesslist = {};
    accesslist.type = type;

    if (type == "only") {
        var i = 0;
        for (; i < access_list.length; i++) {
            accesslist[access_list[i]] = true;
        }
    }
    else if (type == "restrict") {
        var i = 0;
        for (; i < access_list.length; i++) {
            accesslist[access_list[i]] = false;
        }
    }
    //Default is for security reasons. Prevents accidental theft of coins/attack
    else if (type == 'default-safe') {
        accesslist.type = 'restrict';
        var restrict_list = ['dumpprivkey', 'walletpassphrasechange', 'stop'];
        var i = 0;
        for (; i < restrict_list.length; i++) {
            accesslist[restrict_list[i]] = false;
        }
    }
    else if (type == 'read-only') {
        accesslist.type = 'restrict';
        var restrict_list = ['addmultisigaddress', 'addnode', 'backupwallet', 'createmultisig', 'createrawtransaction', 'encryptwallet', 'importprivkey', 'keypoolrefill', 'lockunspent', 'move', 'sendfrom', 'sendmany', 'sendrawtransaction', 'sendtoaddress', 'setaccount', 'setgenerate', 'settxfee', 'signmessage', 'signrawtransaction', 'stop', 'submitblock', 'walletlock', 'walletpassphrasechange'];
        var i = 0;
        for (; i < restrict_list.length; i++) {
            accesslist[restrict_list[i]] = false;
        }
    }
};

const setWalletDetails = (details) => {
    if ('undefined' == typeof details.rpc) {        
        client = new Client({
            host : details.host,
            port : details.port,
            username : details.user,
            password : details.pass
        });
        client.getInfo().then((help) => console.log('bitcoin help 1:',help));
    } else {
        client.getInfo().then((help) => console.log('bitcoin help 2:',help));
        client = details;
    }
};

const setWalletPassphrase = (passphrase) => {
    wallet_passphrase = passphrase;
};

const hasAccess = (req, res, next) => {
    if (accesslist.type == 'all') {
        return next();
    }

    let method = req.path.substring(1, req.path.length);
    if ('undefined' == typeof accesslist[method]) {
        if (accesslist.type == 'only') {
            res.end('This method is restricted.');
        } else {
            return next();
        }
    } else {
        if (accesslist[method] == true) {
            return next();
        } else {
            res.end('This method is restricted.');
        }
    }
};

const specialApiCase = (method_name) => {
    let params = [];
    if (method_name == 'sendmany') {
        let after_account = false;
        let before_min_conf = true;
        let address_info = {};
        for (let parameter in query_parameters) {
            if (query_parameters.hasOwnProperty(parameter)) {
                if (parameter == 'minconf') {
                    before_min_conf = false;
                    params.push(address_info);
                }
                let param = query_parameters[parameter];
                if (!isNaN(param)) {
                    param = parseFloat(param);
                }
                if (after_account && before_min_conf) {
                    address_info[parameter] = param;
                } else {
                    params.push(param);
                }
                if (parameter == 'account') after_account = true;
            }
        }
        if (before_min_conf) {
            params.push(address_info);
        }
    }

    return [{
        method: method_name,
        parameters: params
    }];
};

const bitcoinApp = ()=>{
    let app = express();

    app.get('*', hasAccess, function (req, res) {
        let method = req.path.substring(1, req.path.length);

        if ('undefined' != typeof requires_passphrase[method]) {
            if (wallet_passphrase) {
                client.walletPassphrase(wallet_passphrase, 10);
            }
            else {
                res.send('A wallet passphrase is needed and has not been set.');
            }
        }

        let query_parameters = req.query;
        let params = [];

        for (var parameter in query_parameters) {
            if (query_parameters.hasOwnProperty(parameter)) {
                var param = query_parameters[parameter];
                if (!isNaN(param)) {
                    param = parseFloat(param);
                }
                params.push(param);
            }
        }

        let command = [];
        if (method == "sendmany") {
            command = specialApiCase('sendmany');
        } else {
            command = [{
                method: method,
                parameters: params
            }];
        }        
        console.log('bitcoin-core command:', command);
        client.command(command, function (err, response) {
            if (err) {
                console.log('bitcoin-core err',err);
                res.send("There was an error. Check your console.");
            } else {
                let data = response;
                if (typeof response === 'object') {
                    if(response.length !==undefined){
                        data = response[0];
                    }
                    res.json(data);
                } else {
                    res.send("" + data);
                }
            }
        });
    });
    return app;
};

module.exports = function(){

  return {
    app: bitcoinApp(),
    setAccess: setAccess,
    setWalletDetails: setWalletDetails,
    setWalletPassphrase: setWalletPassphrase
  }
}();