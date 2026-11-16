const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/student.controller');

router.get('/semester-plan', authenticate, ctrl.getSemesterPlan);
router.post('/semester-plan', authenticate, ctrl.saveSemesterFees);
router.post('/first-salary', authenticate, ctrl.getFirstSalaryPlan);

module.exports = router;
