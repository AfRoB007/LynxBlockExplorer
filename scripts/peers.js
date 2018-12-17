var settings = require('../lib/settings')
  , helpers = require('../helpers')
  , axios = require('axios')
  , co = require('co');

var { common } = require('../helpers');

function getPeers(){
  return new Promise(function(resolve,reject){
    axios.get('http://127.0.0.1:' + settings.port+'/api/getpeerinfo')
        .then(function(res){
          resolve(res.data);
        })
        .catch(reject);
  });  
}

helpers.connect(function() {
  co(function* (){
    console.log('Syncing peers ...');
    let peersToInsert = [];    
    let peers = yield getPeers();
    let peersLength = peers.length;

    for(let index=0; index < peersLength; index++){
      let p = peers[index];
      if(p.addr && p.subver){
        let address = p.addr.substr(0,p.addr.lastIndexOf(':')).replace('[','').replace(']','');        
        let version = p.subver.replace('/', '').replace('/', '');
        let country = yield common.getCountryName(address);

        let peer = {
          address : address,
          protocol: p.version,
          version : version,
          country : country,
          createdAt : new Date()
        };
        let isAlreadyExist = yield helpers.db.peers.isAlreadyExist(address);
        if(!isAlreadyExist){
          peersToInsert.push(peer);
        }        
      }      
    }  
    if(peersToInsert.length>0){
      let result = yield helpers.db.peers.bulkInsert(peersToInsert);
      console.log(result.insertedCount+' peers are saved.');
    }else{
      console.log('Already up to date');
    }
    helpers.disconnect();
    process.exit(0);
  }).catch(err=>{
      console.log('Aborting:',err.message);
      process.exit(1);
  });
});
