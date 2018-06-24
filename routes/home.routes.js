var express = require('express');
var controller = require('../controllers/home.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/network', controller.network);
router.get('/movement', controller.movement);
router.get('/info', controller.info);
router.get('/richlist', controller.richList);
router.get('/markets/:market', controller.market);
router.get('/address/:hash/:count?', controller.address);
router.post('/search', controller.search);

module.exports = router;