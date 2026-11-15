const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const chatbotController = require('../controllers/chatbot.controller');

const router = express.Router();

/**
 * Optional authentication: decodes Bearer token if present, otherwise lets guest through.
 */
function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = {
        id: decoded.userId,
        userId: decoded.userId,
        role: decoded.role,
      };
    }
  } catch (err) {
    // If token expired or invalid, continue as guest
    req.user = null;
  }
  next();
}

router.post('/message', optionalAuth, chatbotController.sendMessage);
router.get('/history', optionalAuth, chatbotController.getHistory);
router.delete('/history', optionalAuth, chatbotController.clearHistory);
router.get('/suggestions', optionalAuth, chatbotController.getStarterSuggestions);

module.exports = router;
