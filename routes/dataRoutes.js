const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/timestamps/:username', requireAuth, dataController.getTimestamps);

router.post('/months/:username', requireAuth, dataController.getMonthsData);

router.put('/months/:username', requireAuth, dataController.updateMonthsData);

router.get('/users', requireAuth, dataController.getUsers);

router.get('/sync-check/:username', requireAuth, dataController.getSyncCheck);

router.post('/sync-check', requireAuth, dataController.syncCheckPost);

router.post('/sync-upload', requireAuth, dataController.syncUpload);

router.post('/sync-download', requireAuth, dataController.syncDownload);

module.exports = router;