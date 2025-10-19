const MasterList = require('../models/MasterList');

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
   * Valida un array de listas maestras (solo si tiene contenido)
   * @param {Array} items - Array a validar
   * @param {string} type - Tipo de items ('projects', 'mainTasks', 'vehicles')
   * @returns {Object} Resultado de validación
   */
  validateArray(items, type) {
    const errors = [];

    // Si el array está vacío, no validar (actualización parcial)
    if (!Array.isArray(items) || items.length === 0) {
      return { isValid: true, errors: [] };
    }

    // Validar límite de elementos
    if (items.length > 500) {
      errors.push(`${type} no puede tener más de 500 elementos`);
      return { isValid: false, errors };
    }

    // Validar cada elemento según su tipo
    if (type === 'projects') {
      items.forEach((project, index) => {
        const projectErrors = this.validateProject(project);
        if (projectErrors.length > 0) {
          errors.push(`Proyecto ${index + 1}: ${projectErrors.join(', ')}`);
        }
      });

      // Verificar IDs únicos
      const ids = items.map(p => p.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`IDs de proyectos duplicados: ${duplicateIds.join(', ')}`);
      }

      // Verificar PNRs únicos
      const pnrs = items.map(p => p.pnr);
      const duplicatePnrs = pnrs.filter((pnr, index) => pnrs.indexOf(pnr) !== index);
      if (duplicatePnrs.length > 0) {
        errors.push(`PNRs duplicados: ${duplicatePnrs.join(', ')}`);
      }
    } else if (type === 'mainTasks') {
      items.forEach((task, index) => {
        const taskErrors = this.validateMainTask(task);
        if (taskErrors.length > 0) {
          errors.push(`Tarea ${index + 1}: ${taskErrors.join(', ')}`);
        }
      });

      // Verificar IDs únicos
      const ids = items.map(t => t.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`IDs de tareas duplicados: ${duplicateIds.join(', ')}`);
      }
    } else if (type === 'vehicles') {
      items.forEach((vehicle, index) => {
        const vehicleErrors = this.validateVehicle(vehicle);
        if (vehicleErrors.length > 0) {
          errors.push(`Vehículo ${index + 1}: ${vehicleErrors.join(', ')}`);
        }
      });

      // Verificar IDs únicos
      const ids = items.map(v => v.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`IDs de vehículos duplicados: ${duplicateIds.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Limpia y normaliza un array (solo si tiene contenido)
   */
  cleanArray(items, type) {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    if (type === 'projects') {
      return items.map(p => ({
        id: p.id.trim(),
        pnr: p.pnr.trim(),
        pnm: p.pnm.trim()
      }));
    } else if (type === 'mainTasks') {
      return items.map(t => ({
        id: t.id.trim(),
        name: t.name.trim()
      }));
    } else if (type === 'vehicles') {
      return items.map(v => ({
        id: v.id.trim(),
        name: v.name.trim()
      }));
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
        updatedAt: masterLists.updatedAt
      };
    } catch (error) {
      console.error('Error en getMasterLists:', error);
      throw error;
    }
  }

  /**
   * Actualiza las listas maestras (solo admin)
   * Soporta actualizaciones parciales - solo actualiza los arrays que tienen contenido
   */
  async updateMasterLists(projects, mainTasks, vehicles) {
    try {
      // Obtener listas actuales
      const currentLists = await MasterList.getMasterLists();

      // Limpiar y normalizar solo los arrays que tienen contenido
      const cleanedProjects = this.cleanArray(projects, 'projects');
      const cleanedMainTasks = this.cleanArray(mainTasks, 'mainTasks');
      const cleanedVehicles = this.cleanArray(vehicles, 'vehicles');

      // Validar solo los arrays que tienen contenido
      const allErrors = [];

      const projectsValidation = this.validateArray(cleanedProjects, 'projects');
      if (!projectsValidation.isValid) {
        allErrors.push(...projectsValidation.errors);
      }

      const mainTasksValidation = this.validateArray(cleanedMainTasks, 'mainTasks');
      if (!mainTasksValidation.isValid) {
        allErrors.push(...mainTasksValidation.errors);
      }

      const vehiclesValidation = this.validateArray(cleanedVehicles, 'vehicles');
      if (!vehiclesValidation.isValid) {
        allErrors.push(...vehiclesValidation.errors);
      }

      if (allErrors.length > 0) {
        return {
          success: false,
          message: allErrors.join('. '),
          statusCode: 400
        };
      }

      // Determinar qué actualizar (usar datos actuales si el array está vacío)
      const finalProjects = cleanedProjects.length > 0 ? cleanedProjects : currentLists.projects;
      const finalMainTasks = cleanedMainTasks.length > 0 ? cleanedMainTasks : currentLists.mainTasks;
      const finalVehicles = cleanedVehicles.length > 0 ? cleanedVehicles : currentLists.vehicles;

      // Log de lo que se está actualizando
      const updates = [];
      if (cleanedProjects.length > 0) updates.push(`projects (${cleanedProjects.length})`);
      if (cleanedMainTasks.length > 0) updates.push(`mainTasks (${cleanedMainTasks.length})`);
      if (cleanedVehicles.length > 0) updates.push(`vehicles (${cleanedVehicles.length})`);
      console.log(`[ConfigService] Actualizando: ${updates.join(', ')}`);

      // Actualizar en la base de datos
      const result = await MasterList.updateMasterLists(
        finalProjects,
        finalMainTasks,
        finalVehicles
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
        message: `Listas maestras actualizadas correctamente: ${updates.join(', ')}`,
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