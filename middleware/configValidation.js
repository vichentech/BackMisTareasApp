const { body, validationResult } = require('express-validator');

/**
 * Middleware de validación para configuración
 */

/**
 * Validación para actualizar listas maestras
 */
const validateUpdateMasterLists = [
  // Validar projects
  body('projects')
    .isArray({ min: 1 })
    .withMessage('projects debe ser un array con al menos un elemento'),
  
  body('projects.*.id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada proyecto debe tener un id válido'),

  body('projects.*.pnr')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada proyecto debe tener un pnr (número de proyecto) válido')
    .isLength({ max: 50 })
    .withMessage('El pnr no puede exceder 50 caracteres'),

  body('projects.*.pnm')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada proyecto debe tener un pnm (nombre de proyecto) válido')
    .isLength({ max: 200 })
    .withMessage('El pnm no puede exceder 200 caracteres'),

  // Validar mainTasks
  body('mainTasks')
    .isArray({ min: 1 })
    .withMessage('mainTasks debe ser un array con al menos un elemento'),
  
  body('mainTasks.*.id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada tarea debe tener un id válido'),

  body('mainTasks.*.name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada tarea debe tener un name válido')
    .isLength({ max: 200 })
    .withMessage('El name de la tarea no puede exceder 200 caracteres'),

  // Validar vehicles
  body('vehicles')
    .isArray({ min: 1 })
    .withMessage('vehicles debe ser un array con al menos un elemento'),
  
  body('vehicles.*.id')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Cada vehículo debe tener un id válido'),

  body('vehicles.*.name')
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