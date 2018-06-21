var express = require('express');
var controller = require('../controllers/explorer.controller');

const router = express.Router();

router.get('/ext/summary',controller.getSummary);

module.exports = router;