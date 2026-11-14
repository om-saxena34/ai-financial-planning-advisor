const { z } = require('zod');

const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
  }),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty'),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be positive'),
  date: z
    .string()
    .or(z.date())
    .optional()
    .default(() => new Date()),
  note: z.string().trim().max(500, 'Note cannot exceed 500 characters').optional().default(''),
  paymentMethod: z
    .enum(['cash', 'upi', 'debit_card', 'credit_card', 'net_banking', 'wallet', 'other'])
    .optional()
    .default('upi'),
  isRecurring: z.boolean().optional().default(false),
});

const updateTransactionSchema = createTransactionSchema.partial();

const queryTransactionSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  search: z.string().optional(),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionSchema,
};
