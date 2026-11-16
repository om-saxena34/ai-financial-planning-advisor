/**
 * Statement upload controller.
 * Parses a CSV bank statement in memory (never writes to disk),
 * sends merchant names to ML service for category prediction,
 * detects unusual spending, and lets users correct categories.
 */
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const axios = require('axios');
const mongoose = require('mongoose');
const UploadBatch = require('../models/UploadBatch');
const CategoryRule = require('../models/CategoryRule');
const Transaction = require('../models/Transaction');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

const ML_URL = config.ML_SERVICE_URL;

const FALLBACK_KEYWORDS = {
  'Food & Dining': ['swiggy', 'zomato', 'mcdonalds', 'kfc', 'dominos', 'pizza', 'mess', 'canteen', 'cafe', 'restaurant', 'biryani', 'tea', 'snack'],
  'Transport': ['uber', 'ola', 'rapido', 'metro', 'petrol', 'fuel', 'fastag', 'irctc', 'railway', 'auto', 'cab'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'croma', 'dmart', 'retail', 'mall'],
  'Utilities': ['jio', 'airtel', 'vodafone', 'vi', 'electricity', 'bescom', 'gas', 'water', 'recharge', 'broadband'],
  'Education': ['college', 'university', 'semester', 'exam', 'tuition', 'fee', 'school', 'book', 'stationery'],
  'Health': ['apollo', 'medplus', 'pharmacy', 'hospital', 'clinic', 'medicine', 'doctor', '1mg', 'pharmeasy'],
  'Entertainment': ['netflix', 'hotstar', 'spotify', 'prime', 'pvr', 'inox', 'youtube', 'bookmyshow'],
  'Savings/Investment': ['groww', 'zerodha', 'mutual fund', 'sip', 'ppf', 'lic', 'invest'],
};

function fallbackCategorize(desc) {
  const lower = desc.toLowerCase();
  for (const [cat, kws] of Object.entries(FALLBACK_KEYWORDS)) {
    if (kws.some((kw) => lower.includes(kw))) return cat;
  }
  return 'Other';
}

// Memory-only upload — no files touch disk
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/** Detect unusual spending: flag rows where amount > median + 1.5×MAD per category */
function detectUnusual(rows) {
  const byCategory = {};
  rows.forEach((r) => {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r.amount);
  });

  const flags = [];
  Object.entries(byCategory).forEach(([cat, amounts]) => {
    const sorted = [...amounts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const med = sorted.length % 2 === 0 ? (sorted[mid-1]+sorted[mid])/2 : sorted[mid];
    const mad = sorted.map((v) => Math.abs(v - med)).sort((a,b)=>a-b);
    const madMid = Math.floor(mad.length/2);
    const madVal = mad.length % 2 === 0 ? (mad[madMid-1]+mad[madMid])/2 : mad[madMid];
    const threshold = med + 1.5 * madVal;
    rows.forEach((r) => {
      if (r.category === cat && r.amount > threshold && r.amount > 500) {
        flags.push({ category: cat, amount: r.amount, reason: `Higher than usual for ${cat} (median ₹${Math.round(med)})` });
      }
    });
  });
  return flags;
}

async function uploadStatement(req, res, next) {
  try {
    if (!req.file) throw ApiError.badRequest('No file uploaded');

    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const csvText = req.file.buffer.toString('utf-8');

    // Parse CSV — expect columns: date, description, amount, type (debit/credit)
    let records;
    try {
      records = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
    } catch (e) {
      throw ApiError.badRequest('Could not read the CSV file. Check the format.');
    }

    if (!records.length) throw ApiError.badRequest('The CSV file is empty');
    if (records.length > 500) throw ApiError.badRequest('File too large — max 500 rows');

    // Find amount/description columns flexibly
    const firstRow = records[0];
    const descKey  = Object.keys(firstRow).find((k) => /desc|narr|detail|particulars/i.test(k)) || Object.keys(firstRow)[1];
    const amountKey = Object.keys(firstRow).find((k) => /amount|amt|debit|credit|withdrawal|deposit/i.test(k)) || Object.keys(firstRow)[2];
    const dateKey   = Object.keys(firstRow).find((k) => /date/i.test(k)) || Object.keys(firstRow)[0];

    // Load user's custom category rules
    const userRules = await CategoryRule.find({ userId });
    const ruleMap = {};
    userRules.forEach((r) => { ruleMap[r.keyword] = r.assignedCategory; });

    // Apply user rules first; then call ML for the rest
    const toML = [];
    const rows = records.map((row, idx) => {
      const desc   = String(row[descKey] || '').trim();
      const amount = Math.abs(parseFloat(row[amountKey]) || 0);
      const dateStr= row[dateKey] || new Date().toISOString();
      const descLower = desc.toLowerCase();

      // Check user rules
      let category = null;
      for (const [kw, cat] of Object.entries(ruleMap)) {
        if (descLower.includes(kw)) { category = cat; break; }
      }
      if (!category) toML.push({ idx, description: desc });

      return { idx, description: desc, amount, dateStr, category };
    });

    // Call ML categorizer in one batch
    if (toML.length > 0) {
      try {
        const mlRes = await axios.post(`${ML_URL}/categorize`, { items: toML }, { timeout: 10000 });
        const mlCategories = mlRes.data.results || [];
        mlCategories.forEach(({ idx, category: cat }) => {
          if (rows[idx]) rows[idx].category = cat;
        });
      } catch (_) {
        // ML offline — use keyword rules
        toML.forEach(({ idx, description }) => {
          if (!rows[idx].category) rows[idx].category = fallbackCategorize(description);
        });
      }
    }

    const finalRows = rows.map((r) => ({ ...r, category: r.category || 'Other' }));
    const unusual   = detectUnusual(finalRows);

    // Save a batch record (no raw data stored, only metadata)
    const batch = await UploadBatch.create({
      userId, fileName: req.file.originalname, rowCount: finalRows.length,
      status: 'pending', unusualSpending: unusual,
    });

    return ApiResponse.success(res, {
      batchId: batch._id,
      rows: finalRows.map((r) => ({ description: r.description, amount: r.amount, dateStr: r.dateStr, category: r.category })),
      unusual,
      totalRows: finalRows.length,
    }, 'Statement read successfully. Check the categories below.');
  } catch (err) { next(err); }
}

async function confirmUpload(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { batchId, rows } = req.body;
    if (!batchId || !Array.isArray(rows)) throw ApiError.badRequest('Send batchId and rows');

    // Save the confirmed transactions
    const txDocs = rows.map((r) => ({
      userId,
      note: r.description || 'Bank transaction',
      amount: Math.abs(r.amount || 0),
      type: r.type === 'credit' ? 'income' : 'expense',
      category: r.category || 'Other',
      date: new Date(r.dateStr || Date.now()),
      paymentMethod: 'upi',
    }));

    await Transaction.insertMany(txDocs);
    await UploadBatch.findByIdAndUpdate(batchId, { status: 'confirmed' });

    return ApiResponse.success(res, { added: txDocs.length }, `Added ${txDocs.length} transactions from your statement.`);
  } catch (err) { next(err); }
}

async function correctCategory(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { keyword, category } = req.body;
    if (!keyword || !category) throw ApiError.badRequest('Send keyword and category');

    await CategoryRule.findOneAndUpdate(
      { userId, keyword: keyword.toLowerCase() },
      { assignedCategory: category },
      { upsert: true, new: true }
    );
    return ApiResponse.success(res, {}, `Got it! "${keyword}" will always go to "${category}" for you.`);
  } catch (err) { next(err); }
}

async function deleteUploadData(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    await UploadBatch.findOneAndUpdate({ _id: req.params.id, userId }, { status: 'deleted' });
    return ApiResponse.success(res, {}, 'Upload data removed.');
  } catch (err) { next(err); }
}

module.exports = { upload, uploadStatement, confirmUpload, correctCategory, deleteUploadData };
