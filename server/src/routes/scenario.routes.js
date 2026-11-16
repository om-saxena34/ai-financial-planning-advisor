const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/scenario.controller');

router.get('/', authenticate, ctrl.listScenarios);
router.post('/', authenticate, ctrl.saveScenario);
router.post('/simulate', authenticate, ctrl.simulateLive);
router.delete('/:id', authenticate, ctrl.deleteScenario);

module.exports = router;
