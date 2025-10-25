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

      console.log(`[TIMESTAMPS] Resultado: ${result.success ? 'SUCCESS' : 'ERROR'}`);
      console.log(`[TIMESTAMPS] Timestamps: ${Object.keys(result.timestamps || {}).length}\n`);

      // Responder según el resultado
      return res.status(result.statusCode || 200).json({
        success: result.success,
        timestamps: result.timestamps || {}
      });
    } catch (error) {
      console.error('[TIMESTAMPS] Error:', error);
      next(error);
    }
  }

  /**
   * POST /data/months/:username
   * Obtener datos completos de meses específicos de un usuario
   * 
   * Body: { "months": ["2024-05", "2024-06"] }
   */
  async getMonthsData(req, res, next) {
    try {
      const { username } = req.params;
      const { months } = req.body;
      const { db, collection } = req.query;

      console.log(`\n[GET_MONTHS] Usuario: ${username}`);
      console.log(`[GET_MONTHS] Meses solicitados: ${months ? months.join(', ') : 'ninguno'}`);

      // Validar que se proporcionó el username
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro username es requerido'
        });
      }

      // Validar que se proporcionó el array de meses
      if (!months) {
        return res.status(400).json({
          success: false,
          message: 'El campo months es requerido en el body'
        });
      }

      // Obtener datos de meses
      const result = await dataService.getMonthsData(username, months, db, collection);

      console.log(`[GET_MONTHS] Resultado: ${result.success ? 'SUCCESS' : 'ERROR'}`);
      console.log(`[GET_MONTHS] Meses obtenidos: ${result.data ? result.data.length : 0}\n`);

      // Responder según el resultado
      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
        data: result.data || []
      });
    } catch (error) {
      console.error('[GET_MONTHS] Error:', error);
      next(error);
    }
  }

  /**
   * PUT /data/months/:username
   * Actualizar datos completos de meses específicos de un usuario
   * 
   * Body: { "data": [{ username, yearMonth, updatedAt, monthData }] }
   */
  async updateMonthsData(req, res, next) {
    try {
      const { username } = req.params;
      const { data } = req.body;
      const { db, collection } = req.query;

      console.log(`\n[UPDATE_MONTHS] Usuario: ${username}`);
      console.log(`[UPDATE_MONTHS] Meses a actualizar: ${data ? data.length : 0}`);

      // Validar que se proporcionó el username
      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro username es requerido'
        });
      }

      // Validar que se proporcionó el array de datos
      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'El campo data es requerido en el body'
        });
      }

      // Actualizar datos de meses
      const result = await dataService.updateMonthsData(username, data, db, collection);

      console.log(`[UPDATE_MONTHS] Resultado: ${result.success ? 'SUCCESS' : 'ERROR'}`);
      if (result.success) {
        console.log(`[UPDATE_MONTHS] Modificados: ${result.modified}, Insertados: ${result.inserted}`);
        if (result.conflicts && result.conflicts.length > 0) {
          console.log(`[UPDATE_MONTHS] Conflictos: ${result.conflicts.length}`);
        }
      }
      console.log('');

      // Responder según el resultado
      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
        conflicts: result.conflicts || []
      });
    } catch (error) {
      console.error('[UPDATE_MONTHS] Error:', error);
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

      console.log(`[USERS] Resultado: ${result.success ? 'SUCCESS' : 'ERROR'}`);
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


  /**
   * POST /admin/users/sync
   * Sincronización masiva de múltiples usuarios (solo admin)
   * 
   * Body: { 
   *   "syncRequests": [
   *     {
   *       "username": "Vicente",
   *       "localTimestamps": {
   *         "2024-06": "2024-06-30T18:00:00.000Z",
   *         "2024-07": "2024-07-15T09:00:00.000Z"
   *       }
   *     }
   *   ]
   * }
   */
  async adminBulkSync(req, res, next) {
    try {
      const { syncRequests } = req.body;
      const { db, collection } = req.query;

      console.log(`\n[ADMIN_BULK_SYNC] Solicitud de sincronización masiva`);
      console.log(`[ADMIN_BULK_SYNC] Usuarios a sincronizar: ${syncRequests ? syncRequests.length : 0}`);

      if (!syncRequests || !Array.isArray(syncRequests)) {
        return res.status(400).json({
          success: false,
          message: 'El campo syncRequests es requerido y debe ser un array'
        });
      }

      if (syncRequests.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El array syncRequests no puede estar vacío'
        });
      }

      for (const request of syncRequests) {
        if (!request.username) {
          return res.status(400).json({
            success: false,
            message: 'Cada elemento de syncRequests debe tener un username'
          });
        }
        if (!request.localTimestamps || typeof request.localTimestamps !== 'object') {
          return res.status(400).json({
            success: false,
            message: `El usuario ${request.username} debe tener localTimestamps como objeto`
          });
        }
      }

      const result = await dataService.adminBulkSync(syncRequests, db, collection);

      console.log(`[ADMIN_BULK_SYNC] Resultado: ${result.success ? 'SUCCESS' : 'ERROR'}`);
      console.log(`[ADMIN_BULK_SYNC] Usuarios procesados: ${Object.keys(result.serverTimestamps || {}).length}`);
      console.log(`[ADMIN_BULK_SYNC] Meses actualizados: ${result.updatedData ? result.updatedData.length : 0}\n`);

      return res.status(result.statusCode || 200).json({
        success: result.success,
        serverTimestamps: result.serverTimestamps || {},
        updatedData: result.updatedData || []
      });
    } catch (error) {
      console.error('[ADMIN_BULK_SYNC] Error:', error);
      next(error);
    }
  }

}

module.exports = new DataController();