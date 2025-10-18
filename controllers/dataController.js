const dataService = require('../services/dataService');

/**
 * Controlador de Datos de Usuario
 * Maneja las peticiones HTTP relacionadas con datos de usuario
 */
class DataController {
  /**
   * GET /data/timestamps/:username
   * Obtener timestamps de todos los meses de un usuario
   */
  async getTimestamps(req, res, next) {
    try {
      const { username } = req.params;

      // Validar que se proporcionó el username
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro username es requerido'
        });
      }

      // Obtener timestamps
      const result = await dataService.getTimestamps(username);

      // Responder según el resultado
      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
        timestamps: result.timestamps || {}
      });
    } catch (error) {
      console.error('Error en getTimestamps:', error);
      next(error);
    }
  }
}

module.exports = new DataController();