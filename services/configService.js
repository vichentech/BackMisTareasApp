const MasterList = require('../models/MasterList');

/**
 * Servicio de Configuración
 * Contiene la lógica de negocio para gestión de listas maestras
 */
class ConfigService {
  /**
   * Valida un proyecto
   */
  validateProject(project) {
    const errors = [];

    if (!project.id || typeof project.id !== 'string' || project.id.trim().length === 0) {
      errors.push('Cada proyecto debe tener un id válido');
    }

    if (!project.pnr || typeof project.pnr !== 'string' || project.pnr.trim().length === 0) {
      errors.push('Cada proyecto debe tener un pnr (número de proyecto) válido');
    }

    if (!project.pnm || typeof project.pnm !== 'string' || project.pnm.trim().length === 0) {
      errors.push('Cada proyecto debe tener un pnm (nombre de proyecto) válido');
    }

    if (project.pnr && project.pnr.length > 50) {
      errors.push('El pnr no puede exceder 50 caracteres');
    }

    if (project.pnm && project.pnm.length > 200) {
      errors.push('El pnm no puede exceder 200 caracteres');
    }

    return errors;
  }

  /**
   * Valida una tarea principal
   */
  validateMainTask(task) {
    const errors = [];

    if (!task.id || typeof task.id !== 'string' || task.id.trim().length === 0) {
      errors.push('Cada tarea debe tener un id válido');
    }

    if (!task.name || typeof task.name !== 'string' || task.name.trim().length === 0) {
      errors.push('Cada tarea debe tener un name válido');
    }

    if (task.name && task.name.length > 200) {
      errors.push('El name de la tarea no puede exceder 200 caracteres');
    }

    return errors;
  }

  /**
   * Valida un vehículo
   */
  validateVehicle(vehicle) {
    const errors = [];

    if (!vehicle.id || typeof vehicle.id !== 'string' || vehicle.id.trim().length === 0) {
      errors.push('Cada vehículo debe tener un id válido');
    }

    if (!vehicle.name || typeof vehicle.name !== 'string' || vehicle.name.trim().length === 0) {
      errors.push('Cada vehículo debe tener un name válido');
    }

    if (vehicle.name && vehicle.name.length > 100) {
      errors.push('El name del vehículo no puede exceder 100 caracteres');
    }

    return errors;
  }

  /**
   * Valida las listas maestras
   */
  validateMasterLists(projects, mainTasks, vehicles) {
    const errors = [];

    // Validar projects
    if (!Array.isArray(projects)) {
      errors.push('projects debe ser un array');
    } else if (projects.length === 0) {
      errors.push('projects no puede estar vacío');
    } else if (projects.length > 500) {
      errors.push('projects no puede tener más de 500 elementos');
    } else {
      projects.forEach((project, index) => {
        const projectErrors = this.validateProject(project);
        if (projectErrors.length > 0) {
          errors.push(`Proyecto ${index + 1}: ${projectErrors.join(', ')}`);
        }
      });

      // Verificar IDs únicos en projects
      const projectIds = projects.map(p => p.id);
      const duplicateProjectIds = projectIds.filter((id, index) => projectIds.indexOf(id) !== index);
      if (duplicateProjectIds.length > 0) {
        errors.push(`IDs de proyectos duplicados: ${duplicateProjectIds.join(', ')}`);
      }

      // Verificar PNRs únicos
      const pnrs = projects.map(p => p.pnr);
      const duplicatePnrs = pnrs.filter((pnr, index) => pnrs.indexOf(pnr) !== index);
      if (duplicatePnrs.length > 0) {
        errors.push(`PNRs duplicados: ${duplicatePnrs.join(', ')}`);
      }
    }

    // Validar mainTasks
    if (!Array.isArray(mainTasks)) {
      errors.push('mainTasks debe ser un array');
    } else if (mainTasks.length === 0) {
      errors.push('mainTasks no puede estar vacío');
    } else if (mainTasks.length > 500) {
      errors.push('mainTasks no puede tener más de 500 elementos');
    } else {
      mainTasks.forEach((task, index) => {
        const taskErrors = this.validateMainTask(task);
        if (taskErrors.length > 0) {
          errors.push(`Tarea ${index + 1}: ${taskErrors.join(', ')}`);
        }
      });

      // Verificar IDs únicos en mainTasks
      const taskIds = mainTasks.map(t => t.id);
      const duplicateTaskIds = taskIds.filter((id, index) => taskIds.indexOf(id) !== index);
      if (duplicateTaskIds.length > 0) {
        errors.push(`IDs de tareas duplicados: ${duplicateTaskIds.join(', ')}`);
      }
    }

    // Validar vehicles
    if (!Array.isArray(vehicles)) {
      errors.push('vehicles debe ser un array');
    } else if (vehicles.length === 0) {
      errors.push('vehicles no puede estar vacío');
    } else if (vehicles.length > 500) {
      errors.push('vehicles no puede tener más de 500 elementos');
    } else {
      vehicles.forEach((vehicle, index) => {
        const vehicleErrors = this.validateVehicle(vehicle);
        if (vehicleErrors.length > 0) {
          errors.push(`Vehículo ${index + 1}: ${vehicleErrors.join(', ')}`);
        }
      });

      // Verificar IDs únicos en vehicles
      const vehicleIds = vehicles.map(v => v.id);
      const duplicateVehicleIds = vehicleIds.filter((id, index) => vehicleIds.indexOf(id) !== index);
      if (duplicateVehicleIds.length > 0) {
        errors.push(`IDs de vehículos duplicados: ${duplicateVehicleIds.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Limpia y normaliza los datos
   */
  cleanMasterLists(projects, mainTasks, vehicles) {
    const cleanProjects = projects.map(p => ({
      id: p.id.trim(),
      pnr: p.pnr.trim(),
      pnm: p.pnm.trim()
    }));

    const cleanMainTasks = mainTasks.map(t => ({
      id: t.id.trim(),
      name: t.name.trim()
    }));

    const cleanVehicles = vehicles.map(v => ({
      id: v.id.trim(),
      name: v.name.trim()
    }));

    return {
      projects: cleanProjects,
      mainTasks: cleanMainTasks,
      vehicles: cleanVehicles
    };
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
        updatedAt: masterLists.updatedAt
      };
    } catch (error) {
      console.error('Error en getMasterLists:', error);
      throw error;
    }
  }

  /**
   * Actualiza las listas maestras (solo admin)
   */
  async updateMasterLists(projects, mainTasks, vehicles) {
    try {
      // Limpiar y normalizar datos
      const cleaned = this.cleanMasterLists(projects, mainTasks, vehicles);

      // Validar
      const validation = this.validateMasterLists(
        cleaned.projects,
        cleaned.mainTasks,
        cleaned.vehicles
      );

      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join('. '),
          statusCode: 400
        };
      }

      // Actualizar
      const result = await MasterList.updateMasterLists(
        cleaned.projects,
        cleaned.mainTasks,
        cleaned.vehicles
      );

      if (!result.success) {
        return {
          success: false,
          message: 'No se pudieron actualizar las listas maestras',
          statusCode: 500
        };
      }

      return {
        success: true,
        message: 'Listas maestras actualizadas correctamente',
        statusCode: 200,
        data: {
          projects: result.data.projects,
          mainTasks: result.data.mainTasks,
          vehicles: result.data.vehicles,
          updatedAt: result.data.updatedAt
        }
      };
    } catch (error) {
      console.error('Error en updateMasterLists:', error);
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
      console.error('Error en initializeMasterLists:', error);
      throw error;
    }
  }
}

module.exports = new ConfigService();