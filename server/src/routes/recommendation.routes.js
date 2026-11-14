const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// GET /api/v1/recommendations - Generate or retrieve active recommendations
router.get('/', (req, res, next) =>
  recommendationController.getRecommendations(req, res, next)
);

// PATCH /api/v1/recommendations/:id/status - Update recommendation status (seen, applied, dismissed)
router.patch('/:id/status', (req, res, next) =>
  recommendationController.updateStatus(req, res, next)
);

module.exports = router;
