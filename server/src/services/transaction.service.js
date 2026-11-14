const mongoose = require('mongoose');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const Transaction = require('../models/Transaction');
const ApiError = require('../utils/ApiError');
const { isEssential, isDiscretionary, getCategoryLabel } = require('../config/categories');

/**
 * List paginated transactions with dynamic filters
 */
async function getTransactions(userId, query = {}) {
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    category,
    type,
    search,
  } = query;

  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  if (type) {
    filter.type = type;
  }

  if (category) {
    filter.category = category;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  if (search) {
    filter.note = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Create a new transaction
 */
async function createTransaction(userId, data) {
  const transaction = await Transaction.create({
    ...data,
    userId,
    date: data.date ? new Date(data.date) : new Date(),
  });
  return transaction;
}

/**
 * Get single transaction by ID
 */
async function getTransactionById(userId, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const transaction = await Transaction.findOne({ _id: id, userId });
  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }
  return transaction;
}

/**
 * Update transaction by ID
 */
async function updateTransaction(userId, id, data) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    { ...data },
    { new: true, runValidators: true }
  );

  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }
  return transaction;
}

/**
 * Delete transaction by ID
 */
async function deleteTransaction(userId, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const deleted = await Transaction.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    throw ApiError.notFound('Transaction not found');
  }
  return { message: 'Transaction deleted successfully' };
}

/**
 * Compute monthly summary, category split & trend
 */
async function getSummary(userId, { month, year } = {}) {
  const uId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();
  const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();

  const startOfMonth = new Date(targetYear, targetMonth, 1);
  const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  // Aggregation for selected month
  const monthlyAgg = await Transaction.aggregate([
    {
      $match: {
        userId: uId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let essentialExpenses = 0;
  let discretionaryExpenses = 0;
  const categoryMap = {};

  monthlyAgg.forEach((item) => {
    const { type, category } = item._id;
    const amount = item.totalAmount;

    if (type === 'income') {
      totalIncome += amount;
    } else if (type === 'expense') {
      totalExpense += amount;
      if (isEssential(category)) {
        essentialExpenses += amount;
      } else {
        discretionaryExpenses += amount;
      }

      categoryMap[category] = (categoryMap[category] || 0) + amount;
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Build category breakdown
  const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => {
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    return {
      category,
      label: getCategoryLabel(category) || category,
      amount,
      percentage: Number(percentage.toFixed(1)),
      type: isEssential(category) ? 'essential' : 'discretionary',
    };
  }).sort((a, b) => b.amount - a.amount);

  // 6-month historical trend
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const trendAgg = await Transaction.aggregate([
    {
      $match: {
        userId: uId,
        date: { $gte: sixMonthsAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendMap = {};

  // Initialize last 6 months buckets
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    trendMap[key] = {
      monthLabel: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
      income: 0,
      expense: 0,
      savings: 0,
    };
  }

  trendAgg.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (trendMap[key]) {
      if (item._id.type === 'income') {
        trendMap[key].income = item.total;
      } else {
        trendMap[key].expense = item.total;
      }
      trendMap[key].savings = trendMap[key].income - trendMap[key].expense;
    }
  });

  const monthlyTrend = Object.values(trendMap);

  return {
    period: {
      month: targetMonth + 1,
      year: targetYear,
      start: startOfMonth,
      end: endOfMonth,
    },
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate: Number(savingsRate.toFixed(1)),
    essentialExpenses,
    discretionaryExpenses,
    essentialRatio: totalExpense > 0 ? Number((essentialExpenses / totalExpense).toFixed(2)) : 0,
    categoryBreakdown,
    monthlyTrend,
  };
}

/**
 * Import transactions from CSV string/buffer
 */
async function importCsv(userId, csvData) {
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (!records || records.length === 0) {
    throw ApiError.badRequest('Uploaded CSV is empty or formatted incorrectly');
  }

  const validTransactions = [];
  const errors = [];

  const validMethods = ['cash', 'upi', 'debit_card', 'credit_card', 'net_banking', 'wallet', 'other'];

  records.forEach((row, index) => {
    try {
      // Find case-insensitive keys
      const dateVal = row.date || row.Date;
      const typeVal = (row.type || row.Type || 'expense').toLowerCase().trim();
      const catVal = (row.category || row.Category || 'other').toLowerCase().trim();
      const amountVal = parseFloat(row.amount || row.Amount);
      const noteVal = row.note || row.Note || row.description || '';
      const rawMethod = (row.paymentMethod || row.PaymentMethod || 'other').toLowerCase().trim();
      const methodVal = validMethods.includes(rawMethod) ? rawMethod : 'other';

      if (!amountVal || isNaN(amountVal) || amountVal <= 0) {
        throw new Error('Invalid amount');
      }

      validTransactions.push({
        userId,
        date: dateVal ? new Date(dateVal) : new Date(),
        type: typeVal === 'income' ? 'income' : 'expense',
        category: catVal,
        amount: amountVal,
        note: noteVal,
        paymentMethod: methodVal,
      });
    } catch (err) {
      errors.push({ row: index + 2, error: err.message });
    }
  });

  if (validTransactions.length === 0) {
    throw ApiError.badRequest('No valid transactions found in CSV', errors);
  }

  const inserted = await Transaction.insertMany(validTransactions);

  return {
    totalRows: records.length,
    importedCount: inserted.length,
    failedCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Export user transactions to CSV string
 */
async function exportCsv(userId, query = {}) {
  const { transactions } = await getTransactions(userId, { ...query, limit: 10000 });

  const rows = transactions.map((t) => ({
    Date: new Date(t.date).toISOString().split('T')[0],
    Type: t.type,
    Category: t.category,
    Amount: t.amount,
    PaymentMethod: t.paymentMethod,
    Note: t.note || '',
    IsRecurring: t.isRecurring ? 'Yes' : 'No',
  }));

  const csv = stringify(rows, { header: true });
  return csv;
}

module.exports = {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  importCsv,
  exportCsv,
};
