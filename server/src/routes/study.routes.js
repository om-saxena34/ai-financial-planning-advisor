const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/study.controller');

router.get('/consent', authenticate, ctrl.getConsent);
router.post('/consent', authenticate, ctrl.recordConsent);
router.get('/quiz/:phase', authenticate, ctrl.getQuiz);
router.post('/quiz', authenticate, ctrl.submitQuiz);
router.post('/event', authenticate, ctrl.logEvent);
router.get('/admin/results', authenticate, ctrl.getAdminResults);

module.exports = router;
