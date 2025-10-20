const setupService = require('../services/setupService');
const jwtService = require('../services/jwtService');

/**
 * Controlador de Configuración Inicial
 * Maneja las peticiones HTTP relacionadas con la configuración inicial del sistema
 */
class SetupController {
  /**
   * GET /setup/status
   * Verifica si el sistema necesita configuración inicial
   * Endpoint público - No requiere autenticación
   */
  async getSetupStatus(req, res, next) {
    try {
      const result = await setupService.checkSetupStatus();

      return res.status(200).json({
        setupNeeded: result.setupNeeded
      });
    } catch (error) {
      console.error('Error en getSetupStatus:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar el estado de configuración del sistema'
      });
    }
  }

  /**
   * POST /setup/create-admin
   * Crea el primer usuario administrador del sistema
   * Endpoint público pero con verificación de seguridad crítica
   * 
   * IMPORTANTE: Este endpoint solo funciona si NO existe ningún administrador
   * Una vez creado el primer admin, este endpoint deja de funcionar
   */
  async createFirstAdmin(req, res, next) {
    try {
      const { username, password } = req.body;

      // Validar que se enviaron los datos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Intentar crear el primer administrador
      const result = await setupService.createFirstAdmin(username, password);

      // Si no fue exitoso, devolver el error apropiado
      if (!result.success) {
        return res.status(result.statusCode).json({
          success: false,
          message: result.message
        });
      }

      // Generar tokens JWT para login automático
      const accessToken = jwtService.generateAccessToken({
        username: result.user.username,
        role: result.user.role
      });

      const refreshToken = jwtService.generateRefreshToken({
        username: result.user.username
      });

      // Devolver respuesta exitosa con tokens
      return res.status(201).json({
        success: true,
        message: result.message,
        user: {
          username: result.user.username,
          role: result.user.role
        },
        token: accessToken,
        accessToken: accessToken,
        refreshToken: refreshToken
      });
    } catch (error) {
      console.error('Error en createFirstAdmin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear el administrador inicial'
      });
    }
  }
}

module.exports = new SetupController();