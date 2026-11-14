const express = require('express');
const calculatorController = require('../controllers/calculator.controller');
const validate = require('../middleware/validate.middleware');
const {
  sipSchema,
  compoundSchema,
  requiredSipSchema,
  stepUpSipSchema,
} = require('../validators/calculator.validator');

const router = express.Router();

router.post('/sip', validate(sipSchema), calculatorController.calculateSip);
router.post(
  '/compound',
  validate(compoundSchema),
  calculatorController.calculateCompound
);
router.post(
  '/required-sip',
  validate(requiredSipSchema),
  calculatorController.calculateRequiredSip
);
router.post(
  '/step-up-sip',
  validate(stepUpSipSchema),
  calculatorController.calculateStepUpSip
);

module.exports = router;
