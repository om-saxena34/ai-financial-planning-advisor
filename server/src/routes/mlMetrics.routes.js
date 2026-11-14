const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');

// GET /api/v1/ml-metrics - Publicly viewable for viva evaluation and model transparency
router.get('/', (req, res, next) =>
  predictionController.getMetrics(req, res, next)
);

module.exports = router;
