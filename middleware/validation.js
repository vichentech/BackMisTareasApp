const { body, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validación para POST /sync/check
 */
const validateSyncCheck = [
  body('username')
    .exists().withMessage('El campo "username" es requerido')
    .isString().withMessage('username debe ser una cadena')
    .notEmpty().withMessage('username no puede estar vacío')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('username debe tener entre 3 y 50 caracteres'),

  body('db')
    .exists().withMessage('El campo "db" es requerido')
    .isString().withMessage('db debe ser una cadena')
    .notEmpty().withMessage('db no puede estar vacío'),

  body('collection')
    .exists().withMessage('El campo "collection" es requerido')
    .isString().withMessage('collection debe ser una cadena')
    .notEmpty().withMessage('collection no puede estar vacío'),

  body('timestamps')
    .exists().withMessage('El campo "timestamps" es requerido')
    .isObject().withMessage('timestamps debe ser un objeto'),

  handleValidationErrors
];

/**
 * Validación para POST /sync/push
 */
const validateSyncPush = [
  body('username')
    .exists().withMessage('El campo "username" es requerido')
    .isString().withMessage('username debe ser una cadena')
    .notEmpty().withMessage('username no puede estar vacío')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('username debe tener entre 3 y 50 caracteres'),

  body('db')
    .exists().withMessage('El campo "db" es requerido')
    .isString().withMessage('db debe ser una cadena')
    .notEmpty().withMessage('db no puede estar vacío'),

  body('collection')
    .exists().withMessage('El campo "collection" es requerido')
    .isString().withMessage('collection debe ser una cadena')
    .notEmpty().withMessage('collection no puede estar vacío'),

  body('data')
    .exists().withMessage('El campo "data" es requerido')
    .isArray().withMessage('data debe ser un array')
    .notEmpty().withMessage('data no puede estar vacío'),

  body('data.*.username')
    .exists().withMessage('username es requerido en cada elemento de data')
    .isString().withMessage('username debe ser una cadena'),

  body('data.*.yearMonth')
    .exists().withMessage('yearMonth es requerido en cada elemento de data')
    .isString().withMessage('yearMonth debe ser una cadena')
    .matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('yearMonth debe tener el formato AAAA-MM'),

  body('data.*.monthData')
    .exists().withMessage('monthData es requerido en cada elemento de data')
    .isObject().withMessage('monthData debe ser un objeto'),

  handleValidationErrors
];

/**
 * Validación para POST /sync/init-indexes
 */
const validateInitIndexes = [
  body('db')
    .exists().withMessage('El campo "db" es requerido')
    .isString().withMessage('db debe ser una cadena')
    .notEmpty().withMessage('db no puede estar vacío'),

  body('collection')
    .exists().withMessage('El campo "collection" es requerido')
    .isString().withMessage('collection debe ser una cadena')
    .notEmpty().withMessage('collection no puede estar vacío'),

  handleValidationErrors
];

module.exports = {
  validateSyncCheck,
  validateSyncPush,
  validateInitIndexes
};