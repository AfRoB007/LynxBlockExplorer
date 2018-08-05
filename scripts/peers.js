var settings = require('../lib/settings')
  , helpers = require('../helpers')
  , axios = require('axios')
  , co = require('co');

function getPeers(){
  return new Promise(function(resolve,reject){
    axios.get('http://seed06.getlynx.io:' + settings.port+'/api/getpeerinfo')
        .then(function(res){
          resolve(res.data);
        })
        .catch(reject);
  });  
}

//Access key is registered by using aruljothiparthiban@hotmail.com
function getCountryName(ip){
  return new Promise(function(resolve,reject){
    axios.get('http://api.ipstack.com/' + ip+'?access_key=68c3b44d82029b3f093252a8d22fbfde')
        .then(function(res){
          resolve(res.data.country_name);
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
        let country = yield getCountryName(address);

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
