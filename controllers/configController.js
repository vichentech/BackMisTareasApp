const configService = require("../services/configService");

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
        holidays: result.companyHolidays || [],
        companyHolidays: result.companyHolidays || [],
        updatedAt: result.updatedAt,
      });
    } catch (error) {
      console.error("Error en getMasterLists:", error);
      next(error);
    }
  }

  async updateMasterLists(req, res, next) {
    try {
      console.log(
        `[CONFIG] Admin ${req.user.username} actualizando listas maestras`
      );

      const {
        projects,
        mainTasks,
        vehicles,
        otherWorkTypes,
        holidays,
        companyHolidays,
      } = req.body;

      const holidaysData = holidays || companyHolidays;

      if (
        projects === undefined ||
        mainTasks === undefined ||
        vehicles === undefined ||
        otherWorkTypes === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Debes enviar projects, mainTasks, vehicles y otherWorkTypes",
        });
      }

      if (
        !Array.isArray(projects) ||
        !Array.isArray(mainTasks) ||
        !Array.isArray(vehicles) ||
        !Array.isArray(otherWorkTypes)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Los campos projects, mainTasks, vehicles y otherWorkTypes deben ser arrays",
        });
      }

      if (holidaysData !== undefined && !Array.isArray(holidaysData)) {
        return res.status(400).json({
          success: false,
          message: "El campo holidays debe ser un array",
        });
      }

      if (holidaysData !== undefined && Array.isArray(holidaysData)) {
        for (let i = 0; i < holidaysData.length; i++) {
          const holiday = holidaysData[i];

          if (typeof holiday !== "object" || holiday === null) {
            return res.status(400).json({
              success: false,
              message: `El festivo en posición ${i + 1} debe ser un objeto`,
            });
          }

          if (
            !holiday.date ||
            typeof holiday.date !== "string" ||
            holiday.date.trim().length === 0
          ) {
            return res.status(400).json({
              success: false,
              message: `El festivo en posición ${
                i + 1
              } debe tener una propiedad "date" válida`,
            });
          }

          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(holiday.date)) {
            return res.status(400).json({
              success: false,
              message: `El festivo en posición ${
                i + 1
              } tiene un formato de fecha inválido. Debe ser YYYY-MM-DD`,
            });
          }

          const parsedDate = new Date(holiday.date);
          if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
              success: false,
              message: `El festivo en posición ${
                i + 1
              } tiene una fecha inválida: ${holiday.date}`,
            });
          }

          if (
            !holiday.name ||
            typeof holiday.name !== "string" ||
            holiday.name.trim().length === 0
          ) {
            return res.status(400).json({
              success: false,
              message: `El festivo en posición ${
                i + 1
              } debe tener una propiedad "name" válida`,
            });
          }
        }
      }

      console.log(
        `[CONFIG] Reemplazando listas: ${projects.length} proyectos, ${
          mainTasks.length
        } tareas, ${vehicles.length} vehículos, ${
          otherWorkTypes.length
        } otros tipos, ${holidaysData ? holidaysData.length : 0} festivos`
      );

      const result = await configService.updateMasterLists(
        projects,
        mainTasks,
        vehicles,
        otherWorkTypes,
        holidaysData || []
      );

      return res.status(result.statusCode || 200).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error en updateMasterLists:", error);
      next(error);
    }
  }

  async initMasterLists(req, res, next) {
    try {
      const result = await configService.initializeMasterLists();

      return res.status(200).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error en initMasterLists:", error);
      next(error);
    }
  }
}

module.exports = new ConfigController();
