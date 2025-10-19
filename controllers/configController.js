const configService = require('../services/configService');

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
   * Actualizar listas maestras (solo admin con JWT)
   * Permite actualizaciones parciales - solo actualiza los arrays que tienen contenido
   */
  async updateMasterLists(req, res, next) {
    try {
      // El middleware requireAdmin ya verificó el token y el rol
      // La información del usuario está en req.user
      console.log(`[CONFIG] Admin ${req.user.username} actualizando listas maestras`);

      const { projects, mainTasks, vehicles } = req.body;

      // Validar que al menos se envió la estructura (aunque estén vacíos)
      if (projects === undefined || mainTasks === undefined || vehicles === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Debes enviar projects, mainTasks y vehicles (pueden estar vacíos)'
        });
      }

      // Validar que al menos uno de los arrays tiene contenido
      const hasProjects = Array.isArray(projects) && projects.length > 0;
      const hasMainTasks = Array.isArray(mainTasks) && mainTasks.length > 0;
      const hasVehicles = Array.isArray(vehicles) && vehicles.length > 0;

      if (!hasProjects && !hasMainTasks && !hasVehicles) {
        return res.status(400).json({
          success: false,
          message: 'Al menos uno de los arrays (projects, mainTasks, vehicles) debe tener contenido'
        });
      }

      // Log de lo que se va a actualizar
      const updating = [];
      if (hasProjects) updating.push(`${projects.length} proyectos`);
      if (hasMainTasks) updating.push(`${mainTasks.length} tareas`);
      if (hasVehicles) updating.push(`${vehicles.length} vehículos`);
      console.log(`[CONFIG] Actualizando: ${updating.join(', ')}`);

      // Actualizar listas (el servicio maneja la actualización parcial)
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