const bcrypt = require('bcrypt');
const User = require('../models/User');

/**
 * Servicio de Autenticación
 * Contiene la lógica de negocio para autenticación y gestión de usuarios
 */
class AuthService {
  constructor() {
    this.saltRounds = 10;
  }

  /**
   * Valida los requisitos de username y password
   */
  validateCredentials(username, password) {
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

    // Validar password
    if (!password || password.length === 0) {
      errors.push('La contraseña es requerida');
    } else if (password.length < 3) {
      errors.push('La contraseña debe tener al menos 3 caracteres');
    } else if (password.length > 100) {
      errors.push('La contraseña no puede exceder 100 caracteres');
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
   * Compara una contraseña con su hash
   */
  async comparePassword(password, hash) {
    try {
      const match = await bcrypt.compare(password, hash);
      return match;
    } catch (error) {
      console.error('Error al comparar contraseña:', error);
      throw new Error('Error al verificar la contraseña');
    }
  }

  /**
   * Autentica un usuario (login regular)
   */
  async authenticateUser(username, password) {
    try {
      // Buscar usuario
      const user = await User.findByUsername(username);

      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas.'
        };
      }

      // Verificar contraseña
      const isPasswordValid = await this.comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales inválidas.'
        };
      }

      return {
        success: true,
        message: 'Login exitoso',
        user: {
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error en authenticateUser:', error);
      throw error;
    }
  }

  /**
   * Autentica un administrador (login admin)
   */
  async authenticateAdmin(username, password) {
    try {
      // Buscar usuario
      const user = await User.findByUsername(username);

      if (!user) {
        return {
          success: false,
          message: 'Credenciales de administrador inválidas.'
        };
      }

      // Verificar que sea admin
      if (user.role !== 'admin') {
        return {
          success: false,
          message: 'Credenciales de administrador inválidas.'
        };
      }

      // Verificar contraseña
      const isPasswordValid = await this.comparePassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales de administrador inválidas.'
        };
      }

      return {
        success: true,
        message: 'Login de admin exitoso',
        user: {
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error en authenticateAdmin:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(username, password, role = 'user') {
    try {
      // Validar credenciales
      const validation = this.validateCredentials(username, password);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join('. '),
          statusCode: 400
        };
      }

      // Verificar si el usuario ya existe
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return {
          success: false,
          message: 'El nombre de usuario ya existe.',
          statusCode: 409
        };
      }

      // Hashear contraseña
      const passwordHash = await this.hashPassword(password);

      // Crear usuario
      const newUser = await User.create({
        username,
        passwordHash,
        role
      });

      return {
        success: true,
        message: 'Usuario creado correctamente.',
        statusCode: 201,
        user: {
          username: newUser.username,
          role: newUser.role
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
      console.error('Error en createUser:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de todos los usuarios
   */
  async getAllUsers() {
    try {
      const usernames = await User.getAllUsernames();
      return {
        success: true,
        users: usernames
      };
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Inicializa los índices de la base de datos
   */
  async initializeDatabase() {
    try {
      await User.initializeIndexes();
      return {
        success: true,
        message: 'Base de datos de autenticación inicializada correctamente'
      };
    } catch (error) {
      console.error('Error al inicializar base de datos:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña del propio usuario
   * Requiere verificar la contraseña actual
   */
  async changePassword(username, currentPassword, newPassword) {
    try {
      // Buscar usuario
      const user = await User.findByUsername(username);

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado.',
          statusCode: 404
        };
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.passwordHash);

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'La contraseña actual es incorrecta.',
          statusCode: 403
        };
      }

      // Validar nueva contraseña
      const validation = this.validateCredentials(username, newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.filter(err => err.includes('contraseña')).join('. '),
          statusCode: 400
        };
      }

      // Verificar que la nueva contraseña sea diferente
      const isSamePassword = await this.comparePassword(newPassword, user.passwordHash);
      if (isSamePassword) {
        return {
          success: false,
          message: 'La nueva contraseña debe ser diferente a la actual.',
          statusCode: 400
        };
      }

      // Hashear nueva contraseña
      const newPasswordHash = await this.hashPassword(newPassword);

      // Actualizar contraseña
      const updated = await User.updatePassword(username, newPasswordHash);

      if (!updated) {
        return {
          success: false,
          message: 'No se pudo actualizar la contraseña.',
          statusCode: 500
        };
      }

      return {
        success: true,
        message: 'Contraseña actualizada correctamente.',
        statusCode: 200
      };
    } catch (error) {
      console.error('Error en changePassword:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de cualquier usuario (solo admin)
   * No requiere la contraseña actual del usuario objetivo
   */
  async adminChangePassword(targetUsername, newPassword) {
    try {
      // Buscar usuario objetivo
      const user = await User.findByUsername(targetUsername);

      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado.',
          statusCode: 404
        };
      }

      // Validar nueva contraseña
      const validation = this.validateCredentials(targetUsername, newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.filter(err => err.includes('contraseña')).join('. '),
          statusCode: 400
        };
      }

      // Hashear nueva contraseña
      const newPasswordHash = await this.hashPassword(newPassword);

      // Actualizar contraseña
      const updated = await User.updatePassword(targetUsername, newPasswordHash);

      if (!updated) {
        return {
          success: false,
          message: 'No se pudo actualizar la contraseña.',
          statusCode: 500
        };
      }

      return {
        success: true,
        message: 'Contraseña del usuario actualizada por el administrador.',
        statusCode: 200
      };
    } catch (error) {
      console.error('Error en adminChangePassword:', error);
      throw error;
    }
  }


/**
 * Obtiene un usuario por username (para refresh token)
 */
async getUserByUsername(username) {
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return null;
    }
    return {
      username: user.username,
      role: user.role
    };
  } catch (error) {
    console.error('Error en getUserByUsername:', error);
    throw error;
  }
}


}








module.exports = new AuthService();