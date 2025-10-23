const express = require('express');
const router = express.Router();
const listsController = require('../controllers/listsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/lists/:username', requireAuth, listsController.getUserLists);

router.post('/lists/:username', requireAuth, listsController.updateUserLists);

module.exports = router;
