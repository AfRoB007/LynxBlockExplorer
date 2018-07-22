var express = require('express');
var controller = require('../controllers/explorer.controller');

const router = express.Router();

router.get('/explorer', controller.index);
router.get('/latest-blocks', controller.latestBlocks);


router.get('/ext/summary', controller.getSummary);
///router.get('/ext/getlasttxs/:min', controller.getLastTransactions);
router.get('/ext/connections', controller.getPeerConnections);
router.get('/ext/getdistribution', controller.getDistribution);
router.get('/ext/getaddress/:hash', controller.getAddress);
router.get('/ext/getbalance/:hash', controller.getBalance);

router.get('/explorer/latest-transactions', controller.getLatestTransactions);

module.exports = router;