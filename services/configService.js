const MasterList = require("../models/MasterList");

/**
 * Servicio de Configuración
 * Contiene la lógica de negocio para gestión de listas maestras
 * Soporta actualizaciones parciales
 */
class ConfigService {
  /**
   * Valida un proyecto
   */
  validateProject(project) {
    const errors = [];

    if (
      !project.id ||
      typeof project.id !== "string" ||
      project.id.trim().length === 0
    ) {
      errors.push("Cada proyecto debe tener un id válido");
    }

    if (
      !project.pnr ||
      typeof project.pnr !== "string" ||
      project.pnr.trim().length === 0
    ) {
      errors.push(
        "Cada proyecto debe tener un pnr (número de proyecto) válido"
      );
    }

    if (
      !project.pnm ||
      typeof project.pnm !== "string" ||
      project.pnm.trim().length === 0
    ) {
      errors.push(
        "Cada proyecto debe tener un pnm (nombre de proyecto) válido"
      );
    }

    if (project.pnr && project.pnr.length > 50) {
      errors.push("El pnr no puede exceder 50 caracteres");
    }

    if (project.pnm && project.pnm.length > 200) {
      errors.push("El pnm no puede exceder 200 caracteres");
    }

    return errors;
  }

  /**
   * Valida una tarea principal
   */
  validateMainTask(task) {
    const errors = [];

    if (
      !task.id ||
      typeof task.id !== "string" ||
      task.id.trim().length === 0
    ) {
      errors.push("Cada tarea debe tener un id válido");
    }

    if (
      !task.name ||
      typeof task.name !== "string" ||
      task.name.trim().length === 0
    ) {
      errors.push("Cada tarea debe tener un name válido");
    }

    if (task.name && task.name.length > 200) {
      errors.push("El name de la tarea no puede exceder 200 caracteres");
    }

    return errors;
  }

  /**
   * Valida un vehículo
   */
  validateVehicle(vehicle) {
    const errors = [];

    if (
      !vehicle.id ||
      typeof vehicle.id !== "string" ||
      vehicle.id.trim().length === 0
    ) {
      errors.push("Cada vehículo debe tener un id válido");
    }

    if (
      !vehicle.name ||
      typeof vehicle.name !== "string" ||
      vehicle.name.trim().length === 0
    ) {
      errors.push("Cada vehículo debe tener un name válido");
    }

    if (vehicle.name && vehicle.name.length > 100) {
      errors.push("El name del vehículo no puede exceder 100 caracteres");
    }

    return errors;
  }

  /**
   * Valida un tipo de trabajo adicional
   */
  validateOtherWorkType(workType) {
    const errors = [];

    if (
      !workType.id ||
      typeof workType.id !== "string" ||
      workType.id.trim().length === 0
    ) {
      errors.push("Cada tipo de trabajo debe tener un id válido");
    }

    if (
      !workType.name ||
      typeof workType.name !== "string" ||
      workType.name.trim().length === 0
    ) {
      errors.push("Cada tipo de trabajo debe tener un name válido");
    }

    if (workType.name && workType.name.length > 100) {
      errors.push(
        "El name del tipo de trabajo no puede exceder 100 caracteres"
      );
    }

    return errors;
  }

validateCompanyHoliday(date) {
  const errors = [];
  
  if (typeof date !== 'string' || date.trim().length === 0) {
    errors.push('Cada festivo debe ser un string válido');
    return errors;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    errors.push(`El festivo "${date}" debe tener formato YYYY-MM-DD`);
    return errors;
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    errors.push(`El festivo "${date}" no es una fecha válida`);
  }

  return errors;
}

  
  /**
   * Valida un array de listas maestras (solo si tiene contenido)
   * @param {Array} items - Array a validar
   * @param {string} type - Tipo de items ('projects', 'mainTasks', 'vehicles', 'otherWorkTypes')
   * @returns {Object} Resultado de validación
   */

validateArray(items, type) {
  const errors = [];

  if (!Array.isArray(items)) {
    return {
      isValid: false,
      errors: [`El campo ${type} debe ser un array`],
    };
  }

  if (type === "projects") {
    items.forEach((project, index) => {
      const projectErrors = this.validateProject(project);
      if (projectErrors.length > 0) {
        errors.push(`Proyecto ${index + 1}: ${projectErrors.join(", ")}`);
      }
    });
  } else if (type === "mainTasks") {
    items.forEach((task, index) => {
      const taskErrors = this.validateMainTask(task);
      if (taskErrors.length > 0) {
        errors.push(`Tarea ${index + 1}: ${taskErrors.join(", ")}`);
      }
    });
  } else if (type === "vehicles") {
    items.forEach((vehicle, index) => {
      const vehicleErrors = this.validateVehicle(vehicle);
      if (vehicleErrors.length > 0) {
        errors.push(`Vehículo ${index + 1}: ${vehicleErrors.join(", ")}`);
      }
    });
  } else if (type === "otherWorkTypes") {
    items.forEach((workType, index) => {
      const workTypeErrors = this.validateOtherWorkType(workType);
      if (workTypeErrors.length > 0) {
        errors.push(
          `Tipo de trabajo ${index + 1}: ${workTypeErrors.join(", ")}`
        );
      }
    });
  } else if (type === "companyHolidays") {
    items.forEach((date, index) => {
      const dateErrors = this.validateCompanyHoliday(date);
      if (dateErrors.length > 0) {
        errors.push(`Festivo ${index + 1}: ${dateErrors.join(", ")}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

  


  /**
   * Limpia y normaliza un array (solo si tiene contenido)
   */

cleanArray(items, type) {
  if (!Array.isArray(items)) {
    return [];
  }

  const cleaned = items.filter((item) => {
    if (type === "companyHolidays") {
      return typeof item === "string" && item.trim().length > 0;
    }
    return item && typeof item === "object";
  });

  if (type === "projects") {
    return cleaned.map((p) => ({
      id: p.id.trim(),
      pnr: p.pnr.trim(),
      pnm: p.pnm.trim(),
    }));
  } else if (type === "mainTasks") {
    return items.map((t) => ({
      id: t.id.trim(),
      name: t.name.trim(),
    }));
  } else if (type === "vehicles") {
    return items.map((v) => ({
      id: v.id.trim(),
      name: v.name.trim(),
    }));
  } else if (type === "otherWorkTypes") {
    return items.map((w) => ({
      id: w.id.trim(),
      name: w.name.trim(),
    }));
  } else if (type === "companyHolidays") {
    return cleaned.map((date) => date.trim());
  }

  return [];
}



  /**
   * Obtiene las listas maestras
   */

async getMasterLists() {
  try {
    const masterLists = await MasterList.getMasterLists();

    return {
      success: true,
      projects: masterLists.projects,
      mainTasks: masterLists.mainTasks,
      vehicles: masterLists.vehicles,
      otherWorkTypes: masterLists.otherWorkTypes,
      companyHolidays: masterLists.companyHolidays || [],
      updatedAt: masterLists.updatedAt,
    };
  } catch (error) {
    console.error("Error en getMasterLists:", error);
    throw error;
  }
}



  /**
   * Actualiza las listas maestras (solo admin)
   * Soporta actualizaciones parciales - solo actualiza los arrays que tienen contenido
   */

async updateMasterLists(projects, mainTasks, vehicles, otherWorkTypes, companyHolidays) {
  try {
    const cleanedProjects = this.cleanArray(projects, "projects");
    const cleanedMainTasks = this.cleanArray(mainTasks, "mainTasks");
    const cleanedVehicles = this.cleanArray(vehicles, "vehicles");
    const cleanedOtherWorkTypes = this.cleanArray(otherWorkTypes, "otherWorkTypes");
    const cleanedCompanyHolidays = this.cleanArray(companyHolidays, "companyHolidays");

    const allErrors = [];

    const projectsValidation = this.validateArray(cleanedProjects, "projects");
    if (!projectsValidation.isValid) {
      allErrors.push(...projectsValidation.errors);
    }

    const mainTasksValidation = this.validateArray(cleanedMainTasks, "mainTasks");
    if (!mainTasksValidation.isValid) {
      allErrors.push(...mainTasksValidation.errors);
    }

    const vehiclesValidation = this.validateArray(cleanedVehicles, "vehicles");
    if (!vehiclesValidation.isValid) {
      allErrors.push(...vehiclesValidation.errors);
    }

    const otherWorkTypesValidation = this.validateArray(cleanedOtherWorkTypes, "otherWorkTypes");
    if (!otherWorkTypesValidation.isValid) {
      allErrors.push(...otherWorkTypesValidation.errors);
    }

    const companyHolidaysValidation = this.validateArray(cleanedCompanyHolidays, "companyHolidays");
    if (!companyHolidaysValidation.isValid) {
      allErrors.push(...companyHolidaysValidation.errors);
    }

    if (allErrors.length > 0) {
      return {
        success: false,
        message: allErrors.join(". "),
        statusCode: 400,
      };
    }

    console.log(`[ConfigService] Reemplazando listas maestras completamente`);
    console.log(
      `[ConfigService] Projects: ${cleanedProjects.length}, MainTasks: ${cleanedMainTasks.length}, Vehicles: ${cleanedVehicles.length}, OtherWorkTypes: ${cleanedOtherWorkTypes.length}, CompanyHolidays: ${cleanedCompanyHolidays.length}`
    );

    const result = await MasterList.updateMasterLists(
      cleanedProjects,
      cleanedMainTasks,
      cleanedVehicles,
      cleanedOtherWorkTypes,
      cleanedCompanyHolidays
    );

    if (!result.success) {
      return {
        success: false,
        message: "No se pudieron actualizar las listas maestras",
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: "Listas maestras actualizadas correctamente.",
      statusCode: 200,
      data: {
        projects: result.data.projects,
        mainTasks: result.data.mainTasks,
        vehicles: result.data.vehicles,
        otherWorkTypes: result.data.otherWorkTypes,
        companyHolidays: result.data.companyHolidays,
        updatedAt: result.data.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error en updateMasterLists:", error);
    throw error;
  }
}
  


  /**
   * Inicializa las listas maestras
   */
  async initializeMasterLists() {
    try {
      const result = await MasterList.initializeMasterLists();
      return result;
    } catch (error) {
      console.error("Error en initializeMasterLists:", error);
      throw error;
    }
  }
}

module.exports = new ConfigService();
