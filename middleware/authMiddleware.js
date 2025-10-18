/**
 * Middleware de Autenticación
 * Verifica que el usuario sea administrador
 */

/**
 * Middleware para verificar que el usuario es administrador
 * NOTA: Este es un middleware básico. En producción deberías usar JWT o sesiones.
 */
const requireAdmin = (req, res, next) => {
  // Obtener credenciales del header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Se requiere autenticación.'
    });
  }

  try {
    // Decodificar credenciales Basic Auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    // Guardar en req para uso posterior
    req.auth = {
      username,
      password
    };

    // Verificar que el usuario es admin (esto se hará en el controlador)
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
};

/**
 * Middleware alternativo usando un header personalizado
 * Útil si el frontend envía el username y role en headers
 */
const requireAdminByHeader = (req, res, next) => {
  const username = req.headers['x-username'];
  const role = req.headers['x-user-role'];

  if (!username || !role) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado. Se requieren headers de autenticación.'
    });
  }

  if (role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }

  req.auth = {
    username,
    role
  };

  next();
};

module.exports = {
  requireAdmin,
  requireAdminByHeader
};