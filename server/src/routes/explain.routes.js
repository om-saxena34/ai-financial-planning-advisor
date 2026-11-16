const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/explain.controller');

router.get('/score', authenticate, ctrl.explainScore);
router.post('/recommendation', authenticate, ctrl.explainRecommendation);

module.exports = router;
