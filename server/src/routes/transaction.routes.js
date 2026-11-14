const express = require('express');
const multer = require('multer');
const transactionController = require('../controllers/transaction.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionSchema,
} = require('../validators/transaction.validator');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const router = express.Router();

// Apply auth to all transaction routes
router.use(authenticate);

router.get('/summary', transactionController.getSummary);
router.get('/export', transactionController.exportCsv);
router.post('/import', upload.single('file'), transactionController.importCsv);

router.get(
  '/',
  validate(queryTransactionSchema, 'query'),
  transactionController.getTransactions
);

router.post(
  '/',
  validate(createTransactionSchema, 'body'),
  transactionController.createTransaction
);

router.get('/:id', transactionController.getTransactionById);

router.put(
  '/:id',
  validate(updateTransactionSchema, 'body'),
  transactionController.updateTransaction
);

router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
