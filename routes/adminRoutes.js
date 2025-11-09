const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const dataController = require('../controllers/dataController');
const { validateCreateUser } = require('../middleware/authValidation');
const { requireAdmin } = require('../middleware/authMiddleware');

router.post('/users', requireAdmin, validateCreateUser, authController.adminCreateUser);

router.post('/users/sync', requireAdmin, dataController.adminBulkSync);

router.delete('/users/:username', requireAdmin, authController.adminDeleteUser);

module.exports = router;