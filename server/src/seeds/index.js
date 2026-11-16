const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const User = require('../models/User');
const FinancialProfile = require('../models/FinancialProfile');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Recommendation = require('../models/Recommendation');
const HealthScoreSnapshot = require('../models/HealthScoreSnapshot');
const { calculateRequiredSip } = require('../utils/financialMath');
const { calculateCompositeScore } = require('../utils/healthScoreCalc');

async function seed() {
  const maskedUri = (config.MONGODB_URI || '').replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log('🌱 Starting FinWise Demo Database Seeder...');
  console.log(`📡 Target Database: ${maskedUri}`);

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.MONGODB_URI);
  }

  const demoEmails = [
    'saver.demo@finwise.com',
    'balanced.demo@finwise.com',
    'overspender.demo@finwise.com',
  ];

  // Clean existing demo data
  const existingUsers = await User.find({ email: { $in: demoEmails } });
  const existingIds = existingUsers.map((u) => u._id);

  if (existingIds.length > 0) {
    await Transaction.deleteMany({ userId: { $in: existingIds } });
    await Goal.deleteMany({ userId: { $in: existingIds } });
    await Recommendation.deleteMany({ userId: { $in: existingIds } });
    await HealthScoreSnapshot.deleteMany({ userId: { $in: existingIds } });
    await FinancialProfile.deleteMany({ userId: { $in: existingIds } });
    await User.deleteMany({ _id: { $in: existingIds } });
    console.log('🧹 Purged previous demo data records.');
  }

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // ── 1. Saver Persona (Aarav Sharma) ──────────────────────────────
  const saverUser = await User.create({
    name: 'Aarav Sharma (Saver)',
    email: 'saver.demo@finwise.com',
    passwordHash: hashedPassword,
    currency: 'INR',
    role: 'user',
  });

  await FinancialProfile.create({
    userId: saverUser._id,
    age: 28,
    occupationType: 'salaried',
    monthlyIncome: 120000,
    fixedExpenses: 35000,
    riskProfile: 'aggressive',
    existingSavings: 450000,
    existingInvestments: 650000,
    dependents: 0,
  });

  // Goals for Saver
  const emergencyTargetDate = new Date();
  emergencyTargetDate.setMonth(emergencyTargetDate.getMonth() + 6);

  const homeTargetDate = new Date();
  homeTargetDate.setFullYear(homeTargetDate.getFullYear() + 4);

  const homeSip = calculateRequiredSip({
    targetAmount: 2000000 - 650000,
    annualRate: 12,
    years: 4,
  }).requiredMonthlySip;

  await Goal.create([
    {
      userId: saverUser._id,
      title: 'Emergency Cushion Buffer',
      type: 'emergency_fund',
      targetAmount: 250000,
      currentAmount: 250000,
      targetDate: emergencyTargetDate,
      priority: 'high',
      expectedReturnRate: 7,
      status: 'completed',
      requiredMonthlySIP: 0,
      feasibility: { isOnTrack: true, shortfall: 0, recommendedSIP: 0 },
    },
    {
      userId: saverUser._id,
      title: 'Home Down Payment',
      type: 'house',
      targetAmount: 2000000,
      currentAmount: 650000,
      targetDate: homeTargetDate,
      priority: 'high',
      expectedReturnRate: 12,
      status: 'in_progress',
      requiredMonthlySIP: homeSip,
      feasibility: { isOnTrack: true, shortfall: 0, recommendedSIP: homeSip },
    },
  ]);

  // ── 2. Balanced Persona (Priya Patel) ─────────────────────────────
  const balancedUser = await User.create({
    name: 'Priya Patel (Balanced)',
    email: 'balanced.demo@finwise.com',
    passwordHash: hashedPassword,
    currency: 'INR',
    role: 'user',
  });

  await FinancialProfile.create({
    userId: balancedUser._id,
    age: 25,
    occupationType: 'salaried',
    monthlyIncome: 75000,
    fixedExpenses: 28000,
    riskProfile: 'moderate',
    existingSavings: 110000,
    existingInvestments: 150000,
    dependents: 0,
  });

  const travelDate = new Date();
  travelDate.setFullYear(travelDate.getFullYear() + 1);
  const travelSip = calculateRequiredSip({
    targetAmount: 180000 - 60000,
    annualRate: 10,
    years: 1,
  }).requiredMonthlySip;

  await Goal.create([
    {
      userId: balancedUser._id,
      title: 'European Vacation',
      type: 'travel',
      targetAmount: 180000,
      currentAmount: 60000,
      targetDate: travelDate,
      priority: 'medium',
      expectedReturnRate: 10,
      status: 'in_progress',
      requiredMonthlySIP: travelSip,
      feasibility: { isOnTrack: true, shortfall: 0, recommendedSIP: travelSip },
    },
  ]);

  // ── 3. Overspender Persona (Rohan Verma) ──────────────────────────
  const overspenderUser = await User.create({
    name: 'Rohan Verma (Overspender)',
    email: 'overspender.demo@finwise.com',
    passwordHash: hashedPassword,
    currency: 'INR',
    role: 'user',
  });

  await FinancialProfile.create({
    userId: overspenderUser._id,
    age: 23,
    occupationType: 'salaried',
    monthlyIncome: 50000,
    fixedExpenses: 26000,
    riskProfile: 'conservative',
    existingSavings: 15000,
    existingInvestments: 0,
    dependents: 0,
  });

  const bikeDate = new Date();
  bikeDate.setMonth(bikeDate.getMonth() + 8);
  const bikeSip = calculateRequiredSip({
    targetAmount: 120000 - 10000,
    annualRate: 8,
    years: 8 / 12,
  }).requiredMonthlySip;

  await Goal.create([
    {
      userId: overspenderUser._id,
      title: 'Electric Motorcycle',
      type: 'car',
      targetAmount: 120000,
      currentAmount: 10000,
      targetDate: bikeDate,
      priority: 'high',
      expectedReturnRate: 8,
      status: 'in_progress',
      requiredMonthlySIP: bikeSip,
      feasibility: { isOnTrack: false, shortfall: 8000, recommendedSIP: bikeSip },
    },
  ]);

  // Generate 6-month historical transactions for each user
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const txDate = new Date(now.getFullYear(), now.getMonth() - m, 5);

    // Saver: High savings, low dining
    await Transaction.create([
      { userId: saverUser._id, type: 'income', category: 'Others', amount: 120000, date: txDate, note: 'Monthly Salary' },
      { userId: saverUser._id, type: 'expense', category: 'Rent', amount: 20000, date: new Date(txDate.getTime() + 86400000), note: 'Apartment Rent' },
      { userId: saverUser._id, type: 'expense', category: 'Food', amount: 8000, date: new Date(txDate.getTime() + 86400000 * 3), note: 'Groceries' },
      { userId: saverUser._id, type: 'expense', category: 'Investments', amount: 45000, date: new Date(txDate.getTime() + 86400000 * 5), note: 'Nifty 50 Index SIP' },
      { userId: saverUser._id, type: 'expense', category: 'Utilities', amount: 4000, date: new Date(txDate.getTime() + 86400000 * 7), note: 'Wifi & Electricity' },
    ]);

    // Balanced: Moderate savings & moderate leisure
    await Transaction.create([
      { userId: balancedUser._id, type: 'income', category: 'Others', amount: 75000, date: txDate, note: 'Monthly Salary' },
      { userId: balancedUser._id, type: 'expense', category: 'Rent', amount: 16000, date: new Date(txDate.getTime() + 86400000), note: 'Studio Apartment Rent' },
      { userId: balancedUser._id, type: 'expense', category: 'Food', amount: 11000, date: new Date(txDate.getTime() + 86400000 * 3), note: 'Groceries & Dining' },
      { userId: balancedUser._id, type: 'expense', category: 'Investments', amount: 15000, date: new Date(txDate.getTime() + 86400000 * 5), note: 'Mutual Fund SIP' },
      { userId: balancedUser._id, type: 'expense', category: 'Entertainment', amount: 4500, date: new Date(txDate.getTime() + 86400000 * 12), note: 'Weekend Movie & Dinner' },
      { userId: balancedUser._id, type: 'expense', category: 'Utilities', amount: 3500, date: new Date(txDate.getTime() + 86400000 * 8), note: 'Utilities & Subscriptions' },
    ]);

    // Overspender: High dining, shopping, EMI, low savings
    await Transaction.create([
      { userId: overspenderUser._id, type: 'income', category: 'Others', amount: 50000, date: txDate, note: 'Monthly Salary' },
      { userId: overspenderUser._id, type: 'expense', category: 'Rent', amount: 14000, date: new Date(txDate.getTime() + 86400000), note: 'Rent' },
      { userId: overspenderUser._id, type: 'expense', category: 'Food', amount: 16500, date: new Date(txDate.getTime() + 86400000 * 4), note: 'Dining Out & Food Delivery' },
      { userId: overspenderUser._id, type: 'expense', category: 'Shopping', amount: 9500, date: new Date(txDate.getTime() + 86400000 * 10), note: 'Online Shopping & Apparel' },
      { userId: overspenderUser._id, type: 'expense', category: 'Entertainment', amount: 6000, date: new Date(txDate.getTime() + 86400000 * 14), note: 'Clubbing & Weekend Parties' },
      { userId: overspenderUser._id, type: 'expense', category: 'EMI/Debt', amount: 5500, date: new Date(txDate.getTime() + 86400000 * 6), note: 'Credit Card EMI' },
    ]);
  }

  // Pre-seed Health Score Snapshots
  await HealthScoreSnapshot.create([
    {
      userId: saverUser._id,
      score: 89,
      band: 'Excellent',
      components: {
        savingsRate: 24,
        expenseRatio: 19,
        emergencyFund: 20,
        debtToIncome: 15,
        investmentRatio: 9,
        goalProgress: 2,
      },
      date: new Date(),
    },
    {
      userId: balancedUser._id,
      score: 74,
      band: 'Good',
      components: {
        savingsRate: 18,
        expenseRatio: 16,
        emergencyFund: 15,
        debtToIncome: 14,
        investmentRatio: 7,
        goalProgress: 4,
      },
      date: new Date(),
    },
    {
      userId: overspenderUser._id,
      score: 36,
      band: 'Poor',
      components: {
        savingsRate: 4,
        expenseRatio: 6,
        emergencyFund: 5,
        debtToIncome: 11,
        investmentRatio: 0,
        goalProgress: 10,
      },
      date: new Date(),
    },
  ]);

  console.log('✅ FinWise Database Seeded Successfully!');
  console.log('====================================================');
  console.log('Demo Credentials for Viva Presentation:');
  console.log('----------------------------------------------------');
  console.log('1. Saver:        saver.demo@finwise.com       / Password@123');
  console.log('2. Balanced:     balanced.demo@finwise.com    / Password@123');
  console.log('3. Overspender:  overspender.demo@finwise.com  / Password@123');
  console.log('====================================================');

  if (require.main === module) {
    await mongoose.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seed;
