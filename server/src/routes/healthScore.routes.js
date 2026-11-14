const express = require('express');
const healthScoreController = require('../controllers/healthScore.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', healthScoreController.getHealthScore);
router.get('/history', healthScoreController.getHistory);
router.post('/calculate', healthScoreController.calculateAndSave);

module.exports = router;
