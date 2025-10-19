const dataService = require('../services/dataService');

/**
 * Controlador de Datos de Usuario
 * Maneja las peticiones HTTP relacionadas con datos de usuario
 */
class DataController {
  /**
   * GET /data/timestamps/:username
   * Obtener timestamps de todos los meses de un usuario
   * 
   * Query params opcionales:
   * - db: Nombre de la base de datos
   * - collection: Nombre de la colección
   */
  async getTimestamps(req, res, next) {
    try {
      const { username } = req.params;
      const { db, collection } = req.query;

      console.log(`\n[TIMESTAMPS] Usuario: ${username}`);
      if (db) console.log(`[TIMESTAMPS] DB: ${db}`);
      if (collection) console.log(`[TIMESTAMPS] Collection: ${collection}`);

      // Validar que se proporcionó el username
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro username es requerido'
        });
      }

      // Obtener timestamps
      const result = await dataService.getTimestamps(username, db, collection);

      console.log(`[TIMESTAMPS] Resultado: ${result.success ? 'OK' : 'ERROR'}`);
      console.log(`[TIMESTAMPS] Timestamps: ${Object.keys(result.timestamps || {}).length}\n`);

      // Responder según el resultado
      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
        timestamps: result.timestamps || {}
      });
    } catch (error) {
      console.error('[TIMESTAMPS] Error:', error);
      next(error);
    }
  }

  /**
   * GET /data/users
   * Obtener lista de todos los usuarios
   */
  async getUsers(req, res, next) {
    try {
      console.log('\n[USERS] Obteniendo lista de usuarios...');

      // Obtener lista de usuarios
      const result = await dataService.getAllUsers();

      console.log(`[USERS] Resultado: ${result.success ? 'OK' : 'ERROR'}`);
      console.log(`[USERS] Total usuarios: ${result.users ? result.users.length : 0}\n`);

      // Responder con la lista de usuarios
      return res.status(200).json({
        success: true,
        users: result.users || []
      });
    } catch (error) {
      console.error('[USERS] Error:', error);
      next(error);
    }
  }
}

module.exports = new DataController();