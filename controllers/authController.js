const authService = require('../services/authService');
const jwtService = require('../services/jwtService');

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP relacionadas con autenticación
 */
class AuthController {
  /**
   * POST /auth/login
   * Login de usuario regular - Devuelve token JWT
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

      // Generar tokens JWT
      const accessToken = jwtService.generateAccessToken({
        username: result.user.username,
        role: result.user.role
      });

      const refreshToken = jwtService.generateRefreshToken({
        username: result.user.username
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        accessToken,
        refreshToken,
        user: {
          username: result.user.username,
          role: result.user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      next(error);
    }
  }

  /**
   * POST /auth/login-admin
   * Login de administrador - Devuelve token JWT
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

      // Generar tokens JWT
      const accessToken = jwtService.generateAccessToken({
        username: result.user.username,
        role: result.user.role
      });

      const refreshToken = jwtService.generateRefreshToken({
        username: result.user.username
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        accessToken,
        refreshToken,
        user: {
          username: result.user.username,
          role: result.user.role
        }
      });
    } catch (error) {
      console.error('Error en loginAdmin:', error);
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Refrescar token de acceso usando refresh token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token es requerido'
        });
      }

      // Verificar refresh token
      const verification = jwtService.verifyToken(refreshToken);

      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido o expirado'
        });
      }

      // Verificar que es un refresh token
      if (verification.decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Se requiere un refresh token.'
        });
      }

      // Obtener información del usuario
      const username = verification.decoded.username;
      const user = await authService.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Generar nuevo access token
      const newAccessToken = jwtService.generateAccessToken({
        username: user.username,
        role: user.role
      });

      return res.status(200).json({
        success: true,
        message: 'Token refrescado correctamente',
        accessToken: newAccessToken
      });
    } catch (error) {
      console.error('Error en refreshToken:', error);
      next(error);
    }
  }

  /**
   * POST /auth/verify
   * Verificar si un token es válido
   */
  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = jwtService.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      const verification = jwtService.verifyToken(token);

      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: verification.error,
          expired: verification.expired
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Token válido',
        user: {
          username: verification.decoded.username,
          role: verification.decoded.role
        }
      });
    } catch (error) {
      console.error('Error en verifyToken:', error);
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
   * GET /data/users
   * Obtener lista de usuarios
   */
  async getUsers(req, res, next) {
    try {
      const result = await authService.getAllUsers();

      return res.status(200).json({
        success: true,
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

  /**
   * POST /auth/admin/users
   * Crear nuevo usuario (solo admin)
   */
  async adminCreateUser(req, res, next) {
    try {
      const { username, password, role } = req.body;

      // Validar que se enviaron los datos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Validar rol
      if (role && !['user', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'El rol debe ser "user" o "admin"'
        });
      }

      // Crear usuario
      const result = await authService.createUser(username, password, role || 'user');

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Usuario creado con éxito.',
        user: result.user
      });
    } catch (error) {
      console.error('Error en adminCreateUser:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();