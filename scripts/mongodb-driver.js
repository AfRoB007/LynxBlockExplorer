var mongoose = require('mongoose');
var isPi = require('detect-rpi');
var npm = require('npmi');
var path = require('path');

if (isPi()) {
    console.log('Downgrading mongodb driver in Raspberry Pi. Please wait ...');    
    var options = {
        name: 'mongoose',
        version: '4.1.0',
        path: '.',
        forceInstall: false,
        npmLoad: {
            loglevel: 'silent'
        }
    };
    npm(options, function (err, result) {
        if (err) {
            if(err.code === npmi.LOAD_ERR){
                console.log('npm load error');
            }
            else if (err.code === npmi.INSTALL_ERR){
                console.log('npm install error');
            }
            return console.log(err.message);
        }        
        // installed
        console.log('downgrade success');
        console.log(options.name+'@'+options.version+' installed successfully in '+path.resolve(options.path));        
    });
}else{
    console.log('Mongodb driver version is 5.1.5');
}