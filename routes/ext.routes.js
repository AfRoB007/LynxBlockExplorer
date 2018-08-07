var express = require('express');
var controller = require('../controllers/ext.controller');

const router = express.Router();

router.get('/latest-txs', controller.latestTxs);
router.get('/address/:hash', controller.address);
router.get('/balance/:hash', controller.balance);
router.get('/distribution', controller.distribution);
router.get('/money-supply', controller.moneySupply);

module.exports = router;