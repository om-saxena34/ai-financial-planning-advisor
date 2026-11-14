const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createGoalSchema,
  updateGoalSchema,
  contributeGoalSchema,
} = require('../validators/goal.validator');

router.use(authenticate);

// GET /api/v1/goals - list user goals
router.get('/', (req, res, next) => goalController.getGoals(req, res, next));

// POST /api/v1/goals - create new goal
router.post('/', validate(createGoalSchema), (req, res, next) =>
  goalController.createGoal(req, res, next)
);

// GET /api/v1/goals/:id - get single goal details
router.get('/:id', (req, res, next) => goalController.getGoalById(req, res, next));

// PUT /api/v1/goals/:id - update goal
router.put('/:id', validate(updateGoalSchema), (req, res, next) =>
  goalController.updateGoal(req, res, next)
);

// POST /api/v1/goals/:id/contribute - add funds to goal
router.post(
  '/:id/contribute',
  validate(contributeGoalSchema),
  (req, res, next) => goalController.contribute(req, res, next)
);

// DELETE /api/v1/goals/:id - delete goal
router.delete('/:id', (req, res, next) =>
  goalController.deleteGoal(req, res, next)
);

module.exports = router;
