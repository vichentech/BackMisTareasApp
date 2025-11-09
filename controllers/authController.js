const authService = require("../services/authService");
const jwtService = require("../services/jwtService");
const User = require("../models/User");
const UserData = require("../models/UserData");

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username y password son requeridos",
        });
      }

      const result = await authService.authenticateUser(username, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message,
        });
      }

      const accessToken = jwtService.generateAccessToken({
        username: result.user.username,
        role: result.user.role,
      });

      const refreshToken = jwtService.generateRefreshToken({
        username: result.user.username,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        accessToken,
        refreshToken,
        user: {
          username: result.user.username,
          role: result.user.role,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      next(error);
    }
  }

  async loginAdmin(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username y password son requeridos",
        });
      }

      const result = await authService.authenticateAdmin(username, password);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.message,
        });
      }

      const accessToken = jwtService.generateAccessToken({
        username: result.user.username,
        role: result.user.role,
      });

      const refreshToken = jwtService.generateRefreshToken({
        username: result.user.username,
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        accessToken,
        refreshToken,
        user: {
          username: result.user.username,
          role: result.user.role,
        },
      });
    } catch (error) {
      console.error("Error en loginAdmin:", error);
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token es requerido",
        });
      }

      const verification = jwtService.verifyToken(refreshToken);

      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: "Refresh token inválido o expirado",
        });
      }

      if (verification.decoded.type !== "refresh") {
        return res.status(401).json({
          success: false,
          message: "Token inválido. Se requiere un refresh token.",
        });
      }

      const username = verification.decoded.username;
      const user = await authService.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      const newAccessToken = jwtService.generateAccessToken({
        username: user.username,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "Token refrescado correctamente",
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error("Error en refreshToken:", error);
      next(error);
    }
  }

  async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = jwtService.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token no proporcionado",
        });
      }

      const verification = jwtService.verifyToken(token);

      if (!verification.valid) {
        return res.status(401).json({
          success: false,
          message: verification.error,
          expired: verification.expired,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Token válido",
        user: {
          username: verification.decoded.username,
          role: verification.decoded.role,
        },
      });
    } catch (error) {
      console.error("Error en verifyToken:", error);
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username y password son requeridos",
        });
      }

      const result = await authService.createUser(username, password, role);

      return res.status(result.statusCode || 201).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error("Error en createUser:", error);
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const result = await authService.getAllUsers();

      return res.status(200).json({
        success: true,
        users: result.users,
      });
    } catch (error) {
      console.error("Error en getUsers:", error);
      next(error);
    }
  }

  async initDatabase(req, res, next) {
    try {
      const result = await authService.initializeDatabase();

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Error en initDatabase:", error);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { username, currentPassword, newPassword } = req.body;

      if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Username, contraseña actual y nueva contraseña son requeridos",
        });
      }

      const result = await authService.changePassword(
        username,
        currentPassword,
        newPassword
      );

      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error("Error en changePassword:", error);
      next(error);
    }
  }

  async adminChangePassword(req, res, next) {
    try {
      const { targetUsername, newPassword } = req.body;

      if (!targetUsername || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Username del usuario objetivo y nueva contraseña son requeridos",
        });
      }

      const result = await authService.adminChangePassword(
        targetUsername,
        newPassword
      );

      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error("Error en adminChangePassword:", error);
      next(error);
    }
  }

  async adminCreateUser(req, res, next) {
    try {
      const { username, password, role } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username y password son requeridos",
        });
      }

      if (role && !["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'El rol debe ser "user" o "admin"',
        });
      }

      const result = await authService.createUser(
        username,
        password,
        role || "user"
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Usuario creado con éxito.",
        user: result.user,
      });
    } catch (error) {
      console.error("Error en adminCreateUser:", error);
      next(error);
    }
  }

  async adminDeleteUser(req, res, next) {
    try {
      const usernameToDelete = req.params.username;
      const adminUsername = req.user.username;

      if (usernameToDelete === adminUsername) {
        return res.status(403).json({
          success: false,
          message:
            "Acción no permitida. Un administrador no puede eliminar su propia cuenta.",
        });
      }

      const userExists = await User.findByUsername(usernameToDelete);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: `Usuario '${usernameToDelete}' no encontrado.`,
        });
      }

      const dbName = process.env.MONGO_DB_NAME || "timeTrackingDB";
      const collectionName =
        process.env.MONGO_COLLECTION_NAME || "monthlydatas";

      const [userDeleted, dataDeleted] = await Promise.all([
        User.delete(usernameToDelete),
        UserData.deleteAllUserData(usernameToDelete, dbName, collectionName),
      ]);

      console.log(
        `Admin '${adminUsername}' eliminó al usuario '${usernameToDelete}' y ${dataDeleted.deletedCount} registros de datos.`
      );

      return res.status(200).json({
        success: true,
        message: `Usuario '${usernameToDelete}' y todos sus datos han sido eliminados correctamente.`,
        deletedRecords: dataDeleted.deletedCount,
      });
    } catch (error) {
      console.error("Error en la eliminación de usuario:", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor al intentar eliminar el usuario.",
      });
    }
  }
}

module.exports = new AuthController();
