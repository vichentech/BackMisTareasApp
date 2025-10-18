const UserData = require('../models/UserData');

/**
 * Servicio de Datos de Usuario
 * Contiene la lógica de negocio para gestión de datos de usuario
 */
class DataService {
  /**
   * Obtiene los timestamps de un usuario
   * @param {string} username - Nombre de usuario
   * @returns {object} Resultado con timestamps
   */
  async getTimestamps(username) {
    try {
      // Validar username
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return {
          success: false,
          message: 'El username es requerido y debe ser válido',
          statusCode: 400
        };
      }

      // Obtener timestamps
      const result = await UserData.getTimestamps(username.trim());

      // Si no se encontraron datos, verificar si el usuario existe
      if (!result.found) {
        // Verificar si el usuario existe en la base de datos de autenticación
        const userExists = await this.checkUserExists(username.trim());
        
        if (!userExists) {
          return {
            success: false,
            message: `Usuario '${username}' no encontrado`,
            statusCode: 404
          };
        }

        // El usuario existe pero no tiene datos
        return {
          success: true,
          message: 'Usuario encontrado pero sin datos',
          timestamps: {},
          statusCode: 200
        };
      }

      return {
        success: true,
        timestamps: result.timestamps,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error en getTimestamps:', error);
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
      console.error('Error al verificar usuario:', error);
      // Si hay error, asumimos que el usuario no existe
      return false;
    }
  }
}

module.exports = new DataService();