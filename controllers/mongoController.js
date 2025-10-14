const mongoService = require('../services/mongoService');

const handleMongoOperation = async (req, res, next) => {
  const { action } = req.body;

  try {
    switch (action) {
      case 'get':
        await handleGetOperation(req, res);
        break;
      case 'save':
        await handleSaveOperation(req, res);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Acción no válida: ${action}. Use 'get' o 'save'.`
        });
    }
  } catch (error) {
    next(error);
  }
};

const handleGetOperation = async (req, res) => {
  const { username, config } = req.body;
  console.log(`[GET] Solicitando datos para usuario: ${username}`);

  try {
    const userData = await mongoService.getUserData(username, config);
    if (userData) {
      console.log(`[GET] ✓ Datos encontrados para: ${username}`);
      return res.status(200).json({
        success: true,
        userData: userData
      });
    } else {
      console.log(`[GET] ⚠ Usuario no encontrado: ${username}`);
      return res.status(200).json({
        success: true,
        userData: null
      });
    }
  } catch (error) {
    console.error(`[GET] ✗ Error al obtener datos:`, error.message);
    throw error;
  }
};

const handleSaveOperation = async (req, res) => {
  const { userData, config } = req.body;
  const username = userData.username;
  console.log(`[SAVE] Guardando datos para usuario: ${username}`);

  try {
    const result = await mongoService.saveUserData(userData, config);
    console.log(`[SAVE] ✓ Datos guardados correctamente para: ${username}`);
    return res.status(200).json({
      success: true,
      message: 'Datos guardados correctamente',
      modified: result.modifiedCount || 0,
      upserted: result.upsertedCount || 0
    });
  } catch (error) {
    console.error(`[SAVE] ✗ Error al guardar datos:`, error.message);
    throw error;
  }
};

/**
 * GET /api/data/:username/updates
 * Obtiene las marcas de tiempo de actualización de todos los meses de un usuario
 */
const getUserUpdates = async (req, res, next) => {
  const { username } = req.params;
  const { config } = req.body;

  console.log(`[GET UPDATES] Solicitando actualizaciones para usuario: ${username}`);

  try {
    const updates = await mongoService.getUserUpdates(username, config);
    
    return res.status(200).json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error(`[GET UPDATES] ✗ Error:`, error.message);
    next(error);
  }
};

/**
 * GET /api/data/:username/:yearMonth
 * Obtiene los datos completos de un mes específico para un usuario
 */
const getMonthData = async (req, res, next) => {
  const { username, yearMonth } = req.params;
  const { config } = req.body;

  console.log(`[GET MONTH] Solicitando datos para: ${username} - ${yearMonth}`);

  try {
    const monthData = await mongoService.getMonthData(username, yearMonth, config);
    
    if (monthData) {
      return res.status(200).json({
        success: true,
        data: monthData
      });
    } else {
      return res.status(404).json({
        success: false,
        message: `No se encontraron datos para ${username} en ${yearMonth}`
      });
    }
  } catch (error) {
    console.error(`[GET MONTH] ✗ Error:`, error.message);
    next(error);
  }
};

/**
 * POST /api/data
 * Guarda o actualiza los datos de un mes completo
 */
const saveMonthData = async (req, res, next) => {
  const { monthData, config } = req.body;
  const { username, yearMonth } = monthData;

  console.log(`[SAVE MONTH] Guardando datos para: ${username} - ${yearMonth}`);

  try {
    const result = await mongoService.saveMonthData(monthData, config);
    
    const wasUpdate = result.matchedCount > 0;
    const message = wasUpdate 
      ? `Datos actualizados correctamente para ${username} - ${yearMonth}`
      : `Datos creados correctamente para ${username} - ${yearMonth}`;

    return res.status(200).json({
      success: true,
      message: message,
      modified: result.modifiedCount || 0,
      upserted: result.upsertedCount || 0,
      matched: result.matchedCount || 0
    });
  } catch (error) {
    console.error(`[SAVE MONTH] ✗ Error:`, error.message);
    next(error);
  }
};

/**
 * POST /api/data/init-indexes
 * Inicializa los índices de la base de datos
 */
const initializeIndexes = async (req, res, next) => {
  const { config } = req.body;

  console.log(`[INIT INDEXES] Creando índices en la base de datos`);

  try {
    await mongoService.createIndexes(config);
    
    return res.status(200).json({
      success: true,
      message: 'Índices creados correctamente'
    });
  } catch (error) {
    console.error(`[INIT INDEXES] ✗ Error:`, error.message);
    next(error);
  }
};

module.exports = {
  handleMongoOperation,
  getUserUpdates,
  getMonthData,
  saveMonthData,
  initializeIndexes
};