var express = require('express');
var controller = require('../controllers/api.controller');

const router = express.Router();

router.get('/recent-block', controller.getRecentBlock);
router.get('/latest-blocks', controller.latestBlocks);
router.get('/address/:hash/:count?', controller.address);
router.get('/richlist', controller.richList);
router.get('/connections', controller.connections);
router.get('/connections/update', controller.updateConnections);
router.get('/market/:market', controller.market);

module.exports = router;