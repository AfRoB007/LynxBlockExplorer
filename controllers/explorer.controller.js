var repository = require('../data-access/explorer.repository');
var richListRepository = require('../data-access/richlist.repository');

exports.getSummary = (req,res) =>{
    console.time(req.originalUrl);
    repository.getSummary().then(summary=>{
        console.timeEnd(req.originalUrl);
        res.send({
            data:[summary]
        });
    }).catch(err=>{
        console.log(err.message);
        res.status(500).send(err.message);
    });
};

exports.getLastTransactions = (req,res) =>{
    console.time(req.originalUrl);
    repository.getLastTransactions(req.params.min).then(data=>{
        console.timeEnd(req.originalUrl);
        res.send({ data });
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.getPeerConnections = (req,res) =>{
    console.time(req.originalUrl);
    repository.getPeerConnections().then(data=>{
        console.timeEnd(req.originalUrl);
        res.send({ data });
    }).catch(err=>{
        res.status(500).send(err.message);
    });
};

exports.getDistribution = (req,res) =>{
    console.time(req.originalUrl);
    richListRepository.getDistribution().then(distribution=>{
        console.timeEnd(req.originalUrl);
        res.send(distribution);
    }).catch(err=>{
        res.send(err);
    });
};