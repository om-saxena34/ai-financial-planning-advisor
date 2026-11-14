const { z } = require('zod');

const goalTypes = [
  'emergency_fund',
  'education',
  'travel',
  'car',
  'house',
  'retirement',
  'wedding',
  'custom',
];

const createGoalSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100),
  type: z.enum(goalTypes).default('custom'),
  targetAmount: z.coerce.number().positive('Target amount must be greater than 0'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative').default(0),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid target date is required',
  }),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  expectedReturnRate: z.coerce.number().min(0).max(30).default(10),
  currentMonthlySIP: z.coerce.number().min(0).default(0),
});

const updateGoalSchema = createGoalSchema.partial().extend({
  status: z.enum(['in_progress', 'completed', 'paused', 'abandoned']).optional(),
});

const contributeGoalSchema = z.object({
  amount: z.coerce.number().positive('Contribution amount must be greater than 0'),
});

module.exports = {
  createGoalSchema,
  updateGoalSchema,
  contributeGoalSchema,
};
