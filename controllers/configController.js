const configService = require('../services/configService');

class ConfigController {


  async getMasterLists(req, res, next) {
  try {
    const result = await configService.getMasterLists();

    return res.status(200).json({
      success: true,
      projects: result.projects,
      mainTasks: result.mainTasks,
      vehicles: result.vehicles,
      otherWorkTypes: result.otherWorkTypes,
      companyHolidays: result.companyHolidays || [],
      updatedAt: result.updatedAt
    });
  } catch (error) {
    console.error('Error en getMasterLists:', error);
    next(error);
  }
}


async updateMasterLists(req, res, next) {
  try {
    console.log(`[CONFIG] Admin ${req.user.username} actualizando listas maestras`);

    const { projects, mainTasks, vehicles, otherWorkTypes, companyHolidays } = req.body;

    if (projects === undefined || mainTasks === undefined || vehicles === undefined || otherWorkTypes === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar projects, mainTasks, vehicles y otherWorkTypes'
      });
    }

    if (!Array.isArray(projects) || !Array.isArray(mainTasks) || !Array.isArray(vehicles) || !Array.isArray(otherWorkTypes)) {
      return res.status(400).json({
        success: false,
        message: 'Los campos projects, mainTasks, vehicles y otherWorkTypes deben ser arrays'
      });
    }

    if (companyHolidays !== undefined && !Array.isArray(companyHolidays)) {
      return res.status(400).json({
        success: false,
        message: 'El campo companyHolidays debe ser un array'
      });
    }

    console.log(`[CONFIG] Reemplazando listas: ${projects.length} proyectos, ${mainTasks.length} tareas, ${vehicles.length} vehículos, ${otherWorkTypes.length} otros tipos, ${companyHolidays ? companyHolidays.length : 0} festivos`);

    const result = await configService.updateMasterLists(projects, mainTasks, vehicles, otherWorkTypes, companyHolidays || []);

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
