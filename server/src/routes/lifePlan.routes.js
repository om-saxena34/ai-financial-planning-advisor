const express = require('express');
const router = express.Router();
const lifePlanController = require('../controllers/lifePlan.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Optional auth for calculating and ladder
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  return next();
};

router.post('/project', optionalAuth, lifePlanController.projectPlan);
router.get('/readiness', optionalAuth, lifePlanController.getReadinessLadder);
router.get('/saved', authenticate, lifePlanController.getSavedPlan);
router.post('/save', authenticate, lifePlanController.savePlan);

module.exports = router;
