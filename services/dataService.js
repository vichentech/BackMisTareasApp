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

      // Usar el método correcto del modelo UserData
      const result = await UserData.getTimestamps(username, targetDb, targetCollection);

      if (!result.success) {
        console.log(`[DataService] Error al obtener timestamps del modelo`);
        return {
          success: false,
          message: 'Error al obtener timestamps',
          timestamps: {},
          statusCode: 500
        };
      }

      if (!result.found) {
        console.log(`[DataService] No se encontraron documentos para el usuario: ${username}`);
        return {
          success: true,
          message: 'No se encontraron datos para este usuario',
          timestamps: {},
          statusCode: 200
        };
      }

      console.log(`[DataService] Timestamps encontrados: ${Object.keys(result.timestamps).length}`);

      return {
        success: true,
        message: 'Timestamps obtenidos correctamente',
        timestamps: result.timestamps,
        statusCode: 200
      };
    } catch (error) {
      console.error('[DataService] Error al obtener timestamps:', error);
      return {
        success: false,
        message: 'Error al obtener timestamps: ' + error.message,
        timestamps: {},
        statusCode: 500
      };
    }
  }

  /**
   * Obtiene los datos completos de meses específicos de un usuario
   */
  async getMonthsData(username, months, dbName = null, collectionName = null) {
    try {
      // Validar entrada
      if (!Array.isArray(months) || months.length === 0) {
        return {
          success: false,
          message: 'El array de meses es requerido y no puede estar vacío',
          data: [],
          statusCode: 400
        };
      }

      // Validar formato de meses (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      const invalidMonths = months.filter(m => !monthRegex.test(m));
      if (invalidMonths.length > 0) {
        return {
          success: false,
          message: `Formato de mes inválido: ${invalidMonths.join(', ')}. Use YYYY-MM`,
          data: [],
          statusCode: 400
        };
      }

      // Usar valores por defecto si no se proporcionan
      const targetDb = dbName || process.env.MONGO_DB_NAME || 'timeTrackingDB';
      const targetCollection = collectionName || process.env.MONGO_COLLECTION_NAME || 'monthlyData';

      console.log(`[DataService] Obteniendo datos de meses para usuario: ${username}`);
      console.log(`[DataService] Meses: ${months.join(', ')}`);

      // Obtener datos del modelo
      const result = await UserData.getMonthsData(username, months, targetDb, targetCollection);

      if (!result.success) {
        return {
          success: false,
          message: 'Error al obtener datos de meses',
          data: [],
          statusCode: 500
        };
      }

      console.log(`[DataService] Datos obtenidos: ${result.data.length} meses`);

      return {
        success: true,
        message: 'Datos obtenidos correctamente',
        data: result.data,
        statusCode: 200
      };
    } catch (error) {
      console.error('[DataService] Error al obtener datos de meses:', error);
      return {
        success: false,
        message: 'Error al obtener datos de meses: ' + error.message,
        data: [],
        statusCode: 500
      };
    }
  }

  /**
   * Actualiza los datos de meses específicos de un usuario
   */
  async updateMonthsData(username, monthsData, dbName = null, collectionName = null) {
    try {
      // Validar entrada
      if (!Array.isArray(monthsData) || monthsData.length === 0) {
        return {
          success: false,
          message: 'El array de datos es requerido y no puede estar vacío',
          conflicts: [],
          statusCode: 400
        };
      }

      // Validar estructura de cada elemento
      for (const monthData of monthsData) {
        if (!monthData.username || !monthData.yearMonth || !monthData.updatedAt) {
          return {
            success: false,
            message: 'Cada elemento debe tener username, yearMonth y updatedAt',
            conflicts: [],
            statusCode: 400
          };
        }

        // Validar que el username coincide
        if (monthData.username !== username) {
          return {
            success: false,
            message: `El username en los datos (${monthData.username}) no coincide con el de la URL (${username})`,
            conflicts: [],
            statusCode: 400
          };
        }
      }

      // Usar valores por defecto si no se proporcionan
      const targetDb = dbName || process.env.MONGO_DB_NAME || 'timeTrackingDB';
      const targetCollection = collectionName || process.env.MONGO_COLLECTION_NAME || 'monthlyData';

      console.log(`[DataService] Actualizando datos de meses para usuario: ${username}`);
      console.log(`[DataService] Meses a actualizar: ${monthsData.length}`);

      // Actualizar datos en el modelo
      const result = await UserData.updateMonthsData(username, monthsData, targetDb, targetCollection);

      if (!result.success) {
        return {
          success: false,
          message: 'Error al actualizar datos de meses',
          conflicts: [],
          statusCode: 500
        };
      }

      console.log(`[DataService] Datos actualizados: ${result.modified} modificados, ${result.inserted} insertados`);
      if (result.conflicts.length > 0) {
        console.log(`[DataService] Conflictos detectados: ${result.conflicts.length}`);
      }

      return {
        success: true,
        message: 'Datos actualizados correctamente',
        modified: result.modified,
        inserted: result.inserted,
        conflicts: result.conflicts,
        statusCode: 200
      };
    } catch (error) {
      console.error('[DataService] Error al actualizar datos de meses:', error);
      return {
        success: false,
        message: 'Error al actualizar datos de meses: ' + error.message,
        conflicts: [],
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