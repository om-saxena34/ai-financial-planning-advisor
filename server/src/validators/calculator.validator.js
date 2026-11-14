const { z } = require('zod');

const sipSchema = z.object({
  monthlyAmount: z.coerce.number().positive('Monthly amount must be positive'),
  annualRate: z.coerce.number().min(0, 'Return rate cannot be negative').max(100),
  years: z.coerce.number().positive('Years must be positive').max(50),
  inflationRate: z.coerce.number().min(0).max(30).optional().default(6),
});

const compoundSchema = z.object({
  principal: z.coerce.number().positive('Principal must be positive'),
  annualRate: z.coerce.number().min(0).max(100),
  years: z.coerce.number().positive().max(50),
  compoundingFrequency: z.coerce.number().int().optional().default(12),
});

const requiredSipSchema = z.object({
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  annualRate: z.coerce.number().min(0).max(100),
  years: z.coerce.number().positive().max(50),
});

const stepUpSipSchema = z.object({
  initialMonthlyAmount: z.coerce.number().positive('Starting amount must be positive'),
  annualRate: z.coerce.number().min(0).max(100),
  years: z.coerce.number().positive().max(50),
  stepUpPercent: z.coerce.number().min(0).max(100).default(10),
});

module.exports = {
  sipSchema,
  compoundSchema,
  requiredSipSchema,
  stepUpSipSchema,
};
