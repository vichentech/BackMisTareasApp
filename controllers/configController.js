const configService = require('../services/configService');
const authService = require('../services/authService');

/**
 * Controlador de Configuración
 * Maneja las peticiones HTTP relacionadas con listas maestras
 */
class ConfigController {
  /**
   * GET /config/master-lists
   * Obtener listas maestras (público)
   */
  async getMasterLists(req, res, next) {
    try {
      const result = await configService.getMasterLists();

      return res.status(200).json({
        projects: result.projects,
        mainTasks: result.mainTasks,
        vehicles: result.vehicles,
        updatedAt: result.updatedAt
      });
    } catch (error) {
      console.error('Error en getMasterLists:', error);
      next(error);
    }
  }

  /**
   * POST /config/master-lists
   * Actualizar listas maestras (solo admin)
   */
  async updateMasterLists(req, res, next) {
    try {
      // Verificar autenticación
      if (!req.auth || !req.auth.username || !req.auth.password) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado. Se requiere autenticación.'
        });
      }

      // Verificar que el usuario es administrador
      const authResult = await authService.authenticateAdmin(
        req.auth.username,
        req.auth.password
      );

      if (!authResult.success) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { projects, mainTasks, vehicles } = req.body;

      // Validar que se enviaron los datos
      if (!projects || !mainTasks || !vehicles) {
        return res.status(400).json({
          success: false,
          message: 'projects, mainTasks y vehicles son requeridos'
        });
      }

      // Actualizar listas
      const result = await configService.updateMasterLists(projects, mainTasks, vehicles);

      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error en updateMasterLists:', error);
      next(error);
    }
  }

  /**
   * POST /config/init-master-lists
   * Inicializar listas maestras
   */
  async initMasterLists(req, res, next) {
    try {
      const result = await configService.initializeMasterLists();

      return res.status(200).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Error en initMasterLists:', error);
      next(error);
    }
  }
}

module.exports = new ConfigController();