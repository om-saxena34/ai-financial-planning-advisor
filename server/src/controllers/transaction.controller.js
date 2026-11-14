const transactionService = require('../services/transaction.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

async function getTransactions(req, res, next) {
  try {
    const result = await transactionService.getTransactions(
      req.user.userId,
      req.query
    );
    return ApiResponse.paginated(
      res,
      result.transactions,
      result.pagination,
      'Transactions retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
}

async function createTransaction(req, res, next) {
  try {
    const data = req.validated || req.body;
    const transaction = await transactionService.createTransaction(
      req.user.userId,
      data
    );
    return ApiResponse.created(
      res,
      { transaction },
      'Transaction recorded successfully'
    );
  } catch (err) {
    next(err);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const transaction = await transactionService.getTransactionById(
      req.user.userId,
      req.params.id
    );
    return ApiResponse.success(res, { transaction }, 'Transaction retrieved');
  } catch (err) {
    next(err);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const data = req.validated || req.body;
    const transaction = await transactionService.updateTransaction(
      req.user.userId,
      req.params.id,
      data
    );
    return ApiResponse.success(res, { transaction }, 'Transaction updated');
  } catch (err) {
    next(err);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const result = await transactionService.deleteTransaction(
      req.user.userId,
      req.params.id
    );
    return ApiResponse.success(res, result, 'Transaction removed');
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await transactionService.getSummary(
      req.user.userId,
      req.query
    );
    return ApiResponse.success(
      res,
      { summary },
      'Financial summary computed'
    );
  } catch (err) {
    next(err);
  }
}

async function importCsv(req, res, next) {
  try {
    let csvData = '';
    if (req.file && req.file.buffer) {
      csvData = req.file.buffer.toString('utf-8');
    } else if (req.body && req.body.csv) {
      csvData = req.body.csv;
    } else {
      throw ApiError.badRequest('Please upload a CSV file or provide CSV string in body');
    }

    const result = await transactionService.importCsv(req.user.userId, csvData);
    return ApiResponse.success(res, result, 'CSV processed successfully');
  } catch (err) {
    next(err);
  }
}

async function exportCsv(req, res, next) {
  try {
    const csvString = await transactionService.exportCsv(
      req.user.userId,
      req.query
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.status(200).send(csvString);
  } catch (err) {
    next(err);
  }
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
