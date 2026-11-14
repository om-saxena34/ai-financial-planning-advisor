const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All prediction endpoints require authentication
router.use(authenticate);

// POST /api/v1/predictions/classify
router.post('/classify', (req, res, next) =>
  predictionController.classify(req, res, next)
);

// POST /api/v1/predictions/forecast
router.post('/forecast', (req, res, next) =>
  predictionController.forecast(req, res, next)
);

// GET /api/v1/predictions/history
router.get('/history', (req, res, next) =>
  predictionController.getHistory(req, res, next)
);

// GET /api/v1/predictions/metrics
router.get('/metrics', (req, res, next) =>
  predictionController.getMetrics(req, res, next)
);

module.exports = router;
