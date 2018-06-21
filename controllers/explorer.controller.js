var repository = require('../data-access/explorer.repository');

exports.getSummary = (req,res) =>{
    console.time('explorer/ext/summary');
    repository.getSummary().then(summary=>{
        console.timeEnd('explorer/ext/summary');
        res.send({
            data:[summary]
        });
    }).catch(err=>{
        console.log(err.message);
        res.status(500).send(err.message);
    });
};