const { MongoClient } = require('mongodb');
const UserData = require('../models/userData');
const User = require('../models/User');

/**
 * Servicio de Datos de Usuario
 * Contiene la lógica de negocio para operaciones con datos de usuario
 */
class DataService {
  /**
   * Obtiene los timestamps de todos los meses de un usuario
   */
  async getTimestamps(username, dbName = null, collectionName = null) {
    try {
      // Usar valores por defecto si no se proporcionan
      const targetDb = dbName || process.env.MONGO_DB_NAME || 'timeTrackingDB';
      const targetCollection = collectionName || process.env.MONGO_COLLECTION_NAME || 'monthlyData';

      console.log(`[DataService] Obteniendo timestamps para usuario: ${username}`);
      console.log(`[DataService] DB: ${targetDb}, Collection: ${targetCollection}`);

      // Obtener todos los documentos del usuario
      const documents = await UserData.findByUsername(username, targetDb, targetCollection);

      if (!documents || documents.length === 0) {
        console.log(`[DataService] No se encontraron documentos para el usuario: ${username}`);
        return {
          success: true,
          message: 'No se encontraron datos para este usuario',
          timestamps: {},
          statusCode: 200
        };
      }

      // Construir objeto de timestamps
      const timestamps = {};
      documents.forEach(doc => {
        if (doc.monthKey && doc.lastModified) {
          timestamps[doc.monthKey] = doc.lastModified;
        }
      });

      console.log(`[DataService] Timestamps encontrados: ${Object.keys(timestamps).length}`);

      return {
        success: true,
        message: 'Timestamps obtenidos correctamente',
        timestamps,
        statusCode: 200
      };
    } catch (error) {
      console.error('[DataService] Error al obtener timestamps:', error);
      return {
        success: false,
        message: 'Error al obtener timestamps',
        timestamps: {},
        statusCode: 500
      };
    }
  }

  /**
   * Obtiene la lista de todos los usuarios
   */
  async getAllUsers() {
    try {
      console.log('[DataService] Obteniendo lista de usuarios...');

      // Obtener todos los usernames de la base de datos de autenticación
      const usernames = await User.getAllUsernames();

      console.log(`[DataService] Usuarios encontrados: ${usernames.length}`);

      return {
        success: true,
        users: usernames
      };
    } catch (error) {
      console.error('[DataService] Error al obtener usuarios:', error);
      throw error;
    }
  }
}

module.exports = new DataService();