const authService = require('../services/authService');

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */
class AuthController {
  /**
   * POST /auth/login
   * Login de usuario regular
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      // Validar que se enviaron los datos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Autenticar usuario
      const result = await authService.authenticateUser(username, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en login:', error);
      next(error);
    }
  }

  /**
   * POST /auth/login-admin
   * Login de administrador
   */
  async loginAdmin(req, res, next) {
    try {
      const { username, password } = req.body;

      // Validar que se enviaron los datos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Autenticar admin
      const result = await authService.authenticateAdmin(username, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en loginAdmin:', error);
      next(error);
    }
  }

  /**
   * POST /auth/create-user
   * Crear nuevo usuario
   */
  async createUser(req, res, next) {
    try {
      const { username, password, role } = req.body;

      // Validar que se enviaron los datos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Crear usuario
      const result = await authService.createUser(username, password, role);

      return res.status(result.statusCode || 201).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error en createUser:', error);
      next(error);
    }
  }

  /**
   * GET /users
   * Obtener lista de usuarios
   */
  async getUsers(req, res, next) {
    try {
      const result = await authService.getAllUsers();

      return res.status(200).json({
        users: result.users
      });
    } catch (error) {
      console.error('Error en getUsers:', error);
      next(error);
    }
  }

  /**
   * POST /auth/init-db
   * Inicializar base de datos de autenticación
   */
  async initDatabase(req, res, next) {
    try {
      const result = await authService.initializeDatabase();

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error en initDatabase:', error);
      next(error);
    }
  }

  /**
   * POST /auth/change-password
   * Cambiar contraseña del propio usuario
   */
  async changePassword(req, res, next) {
    try {
      const { username, currentPassword, newPassword } = req.body;

      // Validar que se enviaron los datos
      if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Username, contraseña actual y nueva contraseña son requeridos'
        });
      }

      // Cambiar contraseña
      const result = await authService.changePassword(username, currentPassword, newPassword);

      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error en changePassword:', error);
      next(error);
    }
  }

  /**
   * POST /auth/admin-change-password
   * Cambiar contraseña de cualquier usuario (solo admin)
   */
  async adminChangePassword(req, res, next) {
    try {
      const { targetUsername, newPassword } = req.body;

      // Validar que se enviaron los datos
      if (!targetUsername || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Username del usuario objetivo y nueva contraseña son requeridos'
        });
      }

      // Cambiar contraseña
      const result = await authService.adminChangePassword(targetUsername, newPassword);

      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error en adminChangePassword:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();