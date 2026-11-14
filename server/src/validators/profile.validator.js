const { z } = require('zod');

const profileSchema = z.object({
  age: z
    .number({ required_error: 'Age is required' })
    .int('Age must be an integer')
    .min(18, 'Age must be at least 18')
    .max(100, 'Age cannot exceed 100'),
  occupationType: z.enum(
    ['student', 'salaried', 'self-employed', 'business', 'other'],
    {
      errorMap: () => ({ message: 'Invalid occupation type' }),
    }
  ),
  monthlyIncome: z
    .number({ required_error: 'Monthly income is required' })
    .min(0, 'Monthly income cannot be negative'),
  fixedExpenses: z
    .number({ required_error: 'Fixed expenses is required' })
    .min(0, 'Fixed expenses cannot be negative'),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive'], {
    errorMap: () => ({ message: 'Invalid risk profile' }),
  }),
  existingSavings: z.number().min(0, 'Savings cannot be negative').default(0),
  existingInvestments: z
    .number()
    .min(0, 'Investments cannot be negative')
    .default(0),
  dependents: z
    .number()
    .int('Dependents must be an integer')
    .min(0, 'Dependents cannot be negative')
    .default(0),
});

module.exports = {
  profileSchema,
};
