var express = require('express');
var controller = require('../controllers/api.controller');

const router = express.Router();

router.get('/coin-details', controller.getCoinDetails);
router.get('/latest-blocks', controller.latestBlocks);
router.get('/address/:hash/:count?', controller.address);
router.get('/richlist', controller.richList);
router.get('/connections', controller.connections);
router.get('/market/:market', controller.market);

module.exports = router;