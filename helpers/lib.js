var co = require('co');
var bitcoin = require('./bitcoin');

const syncLoop = (iterations, process, exit) => {
  let index = 0, done = false, shouldExit = false;
  let loop = {
    next: function () {
      if (done) {
        if (shouldExit && exit) {
          exit(); // Exit if we're done
        }
        return; // Stop the loop if we're done
      }
      // If we're not finished
      if (index < iterations) {
        index++; // Increment our index
        if (index % 100 === 0) {
          // clear stack
          setTimeout(function () {
            process(loop); // Run our process, pass in the loop
          }, 1);
        } else {
          process(loop); // Run our process, pass in the loop
        }
        // Otherwise we're done
      } else {
        done = true; // Make sure we say we're done
        if (exit) exit(); // Call the callback on exit
      }
    },
    iteration: function () {
      return index - 1 // Return the loop number we're on
    },
    break: function (end) {
      done = true; // End the loop
      shouldExit = end; // Passing end as true means we still call the exit callback
    }
  }
  loop.next();
  return loop;
};

const prepare_vin = (tx) => {
  return new Promise((resolve, reject) => {
    co(function* () {
      let arr_vin = [];
      let addressArray = yield tx.vin.map(p => getInputAddresses(p, tx.vout));
      if (addressArray.length > 0 && addressArray[0].length>0) {
        let addresses = addressArray[0];

        let index = arr_vin.findIndex(p => p.address === addresses[0].hash);
        let amount = bitcoin.convertToSatoshi(parseFloat(addresses[0].amount));
        //push to array
        if (index === -1) {
          arr_vin.push({
            addresses: addresses[0].hash,
            amount
          });
        } else {
          arr_vin[index].amount = arr_vin[index].amount + amount;
        }
      }
      resolve(arr_vin);
    });
  });
};

const prepare_vout = (vout, txid, vin)=>{  
  return new Promise((resolve,reject)=>{
    co(function* (){
        let arr_vout = [];
        let arr_vin = [];
        arr_vin = vin;
        let length = vout.length;
        for(let i=0; i< length; i++){
          if (vout[i].scriptPubKey.type != 'nonstandard' && vout[i].scriptPubKey.type != 'nulldata') {
            let index = arr_vout.findIndex(p=> p.address === vout[i].scriptPubKey.addresses[0]);
            let amount = bitcoin.convertToSatoshi(parseFloat(vout[i].value));
            //push to array
            if(index===-1){                    
              arr_vout.push({
                addresses : vout[i].scriptPubKey.addresses[0], 
                amount
              });          
            }else{
              arr_vout[index].amount = arr_vout[index].amount + amount;
            }
          }
        }

        if (vout[0].scriptPubKey.type == 'nonstandard'
            && arr_vin.length > 0 
            && arr_vout.length > 0
            && arr_vin[0].addresses == arr_vout[0].addresses) {
           //PoS
           arr_vout[0].amount = arr_vout[0].amount - arr_vin[0].amount;
           arr_vin.shift();
        }
        resolve({
          vout : arr_vout, 
          nvin : arr_vin
        });
    });
  });
};

const getInputAddresses = (input, vout)=>{  
  return new Promise((resolve,reject)=>{
      co(function* (){
        let addresses = [];
        if (input.coinbase) {
          let amount = vout.reduce((acc, p) => acc + parseFloat(p.value), 0);
          addresses.push({ hash: 'coinbase', amount });
          resolve(addresses);
        } else {
          let tx = yield bitcoin.getRawTransaction(input.txid);          
          if(tx && tx !== bitcoin.CONSOLE_ERROR){
            tx.vout.forEach(p=>{
              if (p.n == input.vout && p.scriptPubKey.addresses) {
                addresses.push({
                  hash: p.scriptPubKey.addresses[0], 
                  amount: p.value
                });
              }
            });  
          }
          resolve(addresses);
        }
      });
  });
};

exports.syncLoop = syncLoop;
exports.prepare_vin = prepare_vin;
exports.prepare_vout = prepare_vout;