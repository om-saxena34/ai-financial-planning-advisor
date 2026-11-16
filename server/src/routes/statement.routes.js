const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/statement.controller');

router.post('/upload', authenticate, ctrl.upload.single('statement'), ctrl.uploadStatement);
router.post('/confirm', authenticate, ctrl.confirmUpload);
router.post('/correct', authenticate, ctrl.correctCategory);
router.delete('/batch/:id', authenticate, ctrl.deleteUploadData);

module.exports = router;
