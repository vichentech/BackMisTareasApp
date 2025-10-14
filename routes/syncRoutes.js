const express = require('express');
const router = express.Router();
const { validateSyncCheck, validateSyncPush, validateInitIndexes } = require('../middleware/validation');
const syncController = require('../controllers/syncController');

/**
 * POST /sync/check
 * Comprueba qué datos necesita actualizar el cliente
 */
router.post('/check', validateSyncCheck, syncController.checkSync);

/**
 * POST /sync/push
 * Recibe y guarda los datos del cliente
 */
router.post('/push', validateSyncPush, syncController.pushSync);

/**
 * POST /sync/init-indexes
 * Inicializa los índices de la base de datos (llamar una vez al configurar)
 */
router.post('/init-indexes', validateInitIndexes, syncController.initIndexes);

module.exports = router;