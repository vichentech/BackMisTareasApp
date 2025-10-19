const jwt = require('jsonwebtoken');

/**
 * Servicio de JWT
 * Maneja la generación y verificación de tokens JWT
 */
class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'default_secret_change_in_production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Genera un token de acceso JWT
   * @param {Object} payload - Datos a incluir en el token (username, role)
   * @returns {string} Token JWT
   */
  generateAccessToken(payload) {
    try {
      const token = jwt.sign(
        {
          username: payload.username,
          role: payload.role,
          type: 'access'
        },
        this.secret,
        {
          expiresIn: this.expiresIn,
          issuer: 'sync-server',
          subject: payload.username
        }
      );
      return token;
    } catch (error) {
      console.error('Error al generar token de acceso:', error);
      throw new Error('Error al generar token de acceso');
    }
  }

  /**
   * Genera un token de refresco JWT
   * @param {Object} payload - Datos a incluir en el token (username)
   * @returns {string} Token JWT de refresco
   */
  generateRefreshToken(payload) {
    try {
      const token = jwt.sign(
        {
          username: payload.username,
          type: 'refresh'
        },
        this.secret,
        {
          expiresIn: this.refreshExpiresIn,
          issuer: 'sync-server',
          subject: payload.username
        }
      );
      return token;
    } catch (error) {
      console.error('Error al generar token de refresco:', error);
      throw new Error('Error al generar token de refresco');
    }
  }

  /**
   * Verifica y decodifica un token JWT
   * @param {string} token - Token a verificar
   * @returns {Object} Payload decodificado
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'sync-server'
      });
      return {
        valid: true,
        decoded
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          error: 'Token expirado',
          expired: true
        };
      } else if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'Token inválido',
          expired: false
        };
      } else {
        return {
          valid: false,
          error: 'Error al verificar token',
          expired: false
        };
      }
    }
  }

  /**
   * Extrae el token del header Authorization
   * @param {string} authHeader - Header de autorización
   * @returns {string|null} Token extraído o null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    // Soportar formato: "Bearer <token>"
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Soportar formato: "<token>" (sin prefijo)
    return authHeader;
  }

  /**
   * Decodifica un token sin verificar (útil para debugging)
   * @param {string} token - Token a decodificar
   * @returns {Object} Payload decodificado
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }
}

module.exports = new JwtService();