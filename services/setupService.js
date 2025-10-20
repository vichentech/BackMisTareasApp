const User = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * Servicio de Configuración Inicial
 * Maneja la lógica de negocio para la configuración inicial del sistema
 */
class SetupService {
  constructor() {
    this.saltRounds = 10;
  }

  /**
   * Verifica si existe al menos un administrador en el sistema
   * @returns {Promise<boolean>} true si existe al menos un admin, false si no
   */
  async hasAdminUser() {
    let client;
    try {
      // User ya es una instancia, no necesitamos crear una nueva
      const result = await User.getCollection();
      client = result.client;
      const collection = result.collection;

      // Buscar si existe al menos un usuario con role 'admin'
      const adminCount = await collection.countDocuments({ role: 'admin' });
      
      return adminCount > 0;
    } catch (error) {
      console.error('Error al verificar existencia de administrador:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Verifica el estado de configuración del sistema
   * @returns {Promise<Object>} Estado de configuración
   */
  async checkSetupStatus() {
    try {
      const hasAdmin = await this.hasAdminUser();
      
      return {
        success: true,
        setupNeeded: !hasAdmin
      };
    } catch (error) {
      console.error('Error al verificar estado de configuración:', error);
      throw error;
    }
  }

  /**
   * Valida los requisitos de username y password para el primer admin
   * Requisitos más estrictos para el administrador inicial
   */
  validateAdminCredentials(username, password) {
    const errors = [];

    // Validar username
    if (!username || username.trim().length === 0) {
      errors.push('El nombre de usuario es requerido');
    } else if (username.length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres');
    } else if (username.length > 50) {
      errors.push('El nombre de usuario no puede exceder 50 caracteres');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
    }

    // Validar password con requisitos más estrictos para admin
    if (!password || password.length === 0) {
      errors.push('La contraseña es requerida');
    } else if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    } else if (password.length > 100) {
      errors.push('La contraseña no puede exceder 100 caracteres');
    } else {
      // Verificar que contenga al menos una mayúscula
      if (!/[A-Z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra mayúscula');
      }
      // Verificar que contenga al menos un número
      if (!/[0-9]/.test(password)) {
        errors.push('La contraseña debe contener al menos un número');
      }
      // Verificar que contenga al menos una minúscula
      if (!/[a-z]/.test(password)) {
        errors.push('La contraseña debe contener al menos una letra minúscula');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Hashea una contraseña usando bcrypt
   */
  async hashPassword(password) {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      console.error('Error al hashear contraseña:', error);
      throw new Error('Error al procesar la contraseña');
    }
  }

  /**
   * Crea el primer usuario administrador del sistema
   * IMPORTANTE: Verifica que no exista ningún admin antes de crear
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Resultado de la operación
   */
  async createFirstAdmin(username, password) {
    try {
      // CRÍTICO: Verificar nuevamente que no exista ningún administrador
      const hasAdmin = await this.hasAdminUser();
      
      if (hasAdmin) {
        return {
          success: false,
          message: 'El sistema ya ha sido configurado.',
          statusCode: 409
        };
      }

      // Validar credenciales con requisitos estrictos
      const validation = this.validateAdminCredentials(username, password);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join('. '),
          statusCode: 400
        };
      }

      // Hashear contraseña
      const passwordHash = await this.hashPassword(password);

      // Crear el primer administrador usando la instancia de User
      const newAdmin = await User.create({
        username,
        passwordHash,
        role: 'admin'
      });

      console.log(`✓ Primer administrador creado: ${username}`);

      return {
        success: true,
        message: 'Administrador creado correctamente.',
        statusCode: 201,
        user: {
          username: newAdmin.username,
          role: newAdmin.role
        }
      };
    } catch (error) {
      if (error.message === 'USERNAME_EXISTS') {
        return {
          success: false,
          message: 'El nombre de usuario ya existe.',
          statusCode: 409
        };
      }
      console.error('Error en createFirstAdmin:', error);
      throw error;
    }
  }
}

module.exports = new SetupService();