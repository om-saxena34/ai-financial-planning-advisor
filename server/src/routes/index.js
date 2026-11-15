const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const transactionRoutes = require('./transaction.routes');
const goalRoutes = require('./goal.routes');
const calculatorRoutes = require('./calculator.routes');
const healthScoreRoutes = require('./healthScore.routes');
const predictionRoutes = require('./prediction.routes');
const recommendationRoutes = require('./recommendation.routes');
const mlMetricsRoutes = require('./mlMetrics.routes');
const chatbotRoutes = require('./chatbot.routes');

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/transactions', transactionRoutes);
router.use('/goals', goalRoutes);
router.use('/calculators', calculatorRoutes);
router.use('/health-score', healthScoreRoutes);
router.use('/predictions', predictionRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/ml-metrics', mlMetricsRoutes);
router.use('/chatbot', chatbotRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'finwise-server',
    version: '1.0.0',
  });
});

module.exports = router;
