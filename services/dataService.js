const UserData = require('../models/userData');

/**
 * Servicio de Datos de Usuario
 * Contiene la lógica de negocio para gestión de datos de usuario
 */
class DataService {
  /**
   * Obtiene los timestamps de un usuario
   * @param {string} username - Nombre de usuario
   * @param {string} dbName - Nombre de la base de datos (opcional)
   * @param {string} collectionName - Nombre de la colección (opcional)
   * @returns {object} Resultado con timestamps
   */
  async getTimestamps(username, dbName = null, collectionName = null) {
    try {
      // Validar username
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return {
          success: false,
          message: 'El username es requerido y debe ser válido',
          statusCode: 400
        };
      }

      // Usar valores por defecto si no se proporcionan
      const finalDbName = dbName || process.env.MONGO_DB_NAME || 'timeTrackingDB';
      const finalCollectionName = collectionName || process.env.MONGO_COLLECTION_NAME || 'monthlyData';

      console.log(`[DataService] Obteniendo timestamps para: ${username}`);
      console.log(`[DataService] DB: ${finalDbName}, Collection: ${finalCollectionName}`);

      // Obtener timestamps
      const result = await UserData.getTimestamps(username.trim(), finalDbName, finalCollectionName);

      // Si no se encontraron datos, verificar si el usuario existe
      if (!result.found) {
        console.log(`[DataService] No se encontraron datos para: ${username}`);
        
        // Verificar si el usuario existe en la base de datos de autenticación
        const userExists = await this.checkUserExists(username.trim());
        
        if (!userExists) {
          console.log(`[DataService] Usuario no existe en authDB: ${username}`);
          return {
            success: false,
            message: `Usuario '${username}' no encontrado`,
            statusCode: 404
          };
        }

        // El usuario existe pero no tiene datos
        console.log(`[DataService] Usuario existe pero sin datos: ${username}`);
        return {
          success: true,
          message: 'Usuario encontrado pero sin datos',
          timestamps: {},
          statusCode: 200
        };
      }

      console.log(`[DataService] Timestamps encontrados: ${Object.keys(result.timestamps).length}`);
      return {
        success: true,
        timestamps: result.timestamps,
        statusCode: 200
      };
    } catch (error) {
      console.error('[DataService] Error en getTimestamps:', error);
      throw error;
    }
  }

  /**
   * Verifica si un usuario existe en la base de datos de autenticación
   * @param {string} username - Nombre de usuario
   * @returns {boolean} true si el usuario existe
   */
  async checkUserExists(username) {
    try {
      const User = require('../models/User');
      const user = await User.findByUsername(username);
      return user !== null;
    } catch (error) {
      console.error('[DataService] Error al verificar usuario:', error);
      // Si hay error, asumimos que el usuario no existe
      return false;
    }
  }
}

module.exports = new DataService();