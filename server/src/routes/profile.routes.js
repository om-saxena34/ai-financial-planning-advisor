const express = require('express');
const profileController = require('../controllers/profile.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { profileSchema } = require('../validators/profile.validator');

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);

router.put(
  '/',
  authenticate,
  validate(profileSchema),
  profileController.upsertProfile
);

router.delete('/', authenticate, profileController.deleteProfile);

module.exports = router;
