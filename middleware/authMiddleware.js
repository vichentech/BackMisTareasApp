const jwtService = require('../services/jwtService');

/**
 * Middleware de Autenticación con JWT
 * Verifica que el usuario esté autenticado mediante token JWT
 */

/**
 * Middleware para verificar que el usuario está autenticado
 * Extrae y valida el token JWT del header Authorization
 */
const requireAuth = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.'
      });
    }

    // Verificar token
    const verification = jwtService.verifyToken(token);

    if (!verification.valid) {
      if (verification.expired) {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor, inicia sesión nuevamente.',
          expired: true
        });
      }
      return res.status(401).json({
        success: false,
        message: verification.error || 'Token inválido.'
      });
    }

    // Guardar información del usuario en req
    req.user = {
      username: verification.decoded.username,
      role: verification.decoded.role
    };

    next();
  } catch (error) {
    console.error('Error en requireAuth:', error);
    return res.status(401).json({
      success: false,
      message: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario es administrador
 * Debe usarse después de requireAuth
 */
const requireAdmin = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.'
      });
    }

    // Verificar token
    const verification = jwtService.verifyToken(token);

    if (!verification.valid) {
      if (verification.expired) {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Por favor, inicia sesión nuevamente.',
          expired: true
        });
      }
      return res.status(401).json({
        success: false,
        message: verification.error || 'Token inválido.'
      });
    }

    // Verificar que el usuario es admin
    if (verification.decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }

    // Guardar información del usuario en req
    req.user = {
      username: verification.decoded.username,
      role: verification.decoded.role
    };

    next();
  } catch (error) {
    console.error('Error en requireAdmin:', error);
    return res.status(403).json({
      success: false,
      message: 'Error al verificar permisos de administrador'
    });
  }
};

/**
 * Middleware opcional para autenticación
 * Si hay token, lo valida, pero no bloquea si no hay token
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const verification = jwtService.verifyToken(token);
      if (verification.valid) {
        req.user = {
          username: verification.decoded.username,
          role: verification.decoded.role
        };
      }
    }

    next();
  } catch (error) {
    // No bloquear si hay error, solo continuar sin usuario
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth
};