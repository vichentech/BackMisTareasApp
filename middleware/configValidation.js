const { body, validationResult } = require('express-validator');

/**
 * Middleware de validación para configuración
 * Permite actualizaciones parciales de listas maestras
 */

/**
 * Validación para actualizar listas maestras
 * Permite arrays vacíos - solo actualiza los arrays que tienen contenido
 */
const validateUpdateMasterLists = [
  // Validar que projects existe y es un array (puede estar vacío)
  body('projects')
    .exists()
    .withMessage('projects es requerido')
    .isArray()
    .withMessage('projects debe ser un array'),
  
  // Si projects tiene elementos, validarlos
  body('projects.*.id')
    .if(body('projects').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada proyecto debe tener un id válido'),

  body('projects.*.pnr')
    .if(body('projects').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada proyecto debe tener un pnr (número de proyecto) válido')
    .isLength({ max: 50 })
    .withMessage('El pnr no puede exceder 50 caracteres'),

  body('projects.*.pnm')
    .if(body('projects').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada proyecto debe tener un pnm (nombre de proyecto) válido')
    .isLength({ max: 200 })
    .withMessage('El pnm no puede exceder 200 caracteres'),

  // Validar que mainTasks existe y es un array (puede estar vacío)
  body('mainTasks')
    .exists()
    .withMessage('mainTasks es requerido')
    .isArray()
    .withMessage('mainTasks debe ser un array'),
  
  // Si mainTasks tiene elementos, validarlos
  body('mainTasks.*.id')
    .if(body('mainTasks').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada tarea debe tener un id válido'),

  body('mainTasks.*.name')
    .if(body('mainTasks').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada tarea debe tener un name válido')
    .isLength({ max: 200 })
    .withMessage('El name de la tarea no puede exceder 200 caracteres'),

  // Validar que vehicles existe y es un array (puede estar vacío)
  body('vehicles')
    .exists()
    .withMessage('vehicles es requerido')
    .isArray()
    .withMessage('vehicles debe ser un array'),
  
  // Si vehicles tiene elementos, validarlos
  body('vehicles.*.id')
    .if(body('vehicles').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada vehículo debe tener un id válido'),

  body('vehicles.*.name')
    .if(body('vehicles').isArray({ min: 1 }))
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada vehículo debe tener un name válido')
    .isLength({ max: 100 })
    .withMessage('El name del vehículo no puede exceder 100 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

module.exports = {
  validateUpdateMasterLists
};