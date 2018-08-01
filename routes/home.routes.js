var express = require('express');
var controller = require('../controllers/home.controller');

const router = express.Router();

router.get('/', controller.index);
router.get('/network', controller.network);
router.get('/movement', controller.movement);
router.get('/info', controller.info);
router.get('/rich-list', controller.richList);
router.get('/markets/:market', controller.market);
router.get('/address/:hash', controller.address);
router.get('/reward', controller.reward);
router.get('/block/:hash', controller.block);
router.get('/tx/:txid', controller.tx);
router.get('/qr/:hash', controller.getQRImage);
router.get('/search', controller.search);

module.exports = router;