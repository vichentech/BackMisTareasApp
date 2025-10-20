const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

/**
 * Rutas de Configuración Inicial
 * Estas rutas son públicas y no requieren autenticación
 * pero tienen verificaciones de seguridad internas
 */

/**
 * GET /setup/status
 * Verifica si el sistema necesita configuración inicial
 * Responde con { setupNeeded: true/false }
 */
router.get('/status', setupController.getSetupStatus);

/**
 * POST /setup/create-admin
 * Crea el primer usuario administrador
 * Body: { username: string, password: string }
 * 
 * IMPORTANTE: Solo funciona si no existe ningún administrador
 * Una vez creado el primer admin, devuelve error 409
 */
router.post('/create-admin', setupController.createFirstAdmin);

module.exports = router;