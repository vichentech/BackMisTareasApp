const syncService = require('../services/syncService');

/**
 * POST /sync/check
 * Comprueba qué datos necesita actualizar el cliente
 */
const checkSync = async (req, res, next) => {
  const { username, db, collection, timestamps } = req.body;

  console.log(`\n[SYNC CHECK] Usuario: ${username}`);
  console.log(`[SYNC CHECK] Meses en cliente: ${Object.keys(timestamps).length}`);

  try {
    // Obtener la cadena de conexión desde variables de entorno o configuración
    const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';
    
    const result = await syncService.checkUpdates(
      username,
      connectionString,
      db,
      collection,
      timestamps
    );

    console.log(`[SYNC CHECK] ✓ Respuesta: ${result.toUpdate.length} meses a actualizar\n`);

    return res.status(200).json(result);
  } catch (error) {
    console.error(`[SYNC CHECK] ✗ Error:`, error.message);
    next(error);
  }
};

/**
 * POST /sync/push
 * Recibe y guarda los datos del cliente
 */
const pushSync = async (req, res, next) => {
  const { username, db, collection, data } = req.body;

  console.log(`\n[SYNC PUSH] Usuario: ${username}`);
  console.log(`[SYNC PUSH] Documentos a guardar: ${data.length}`);

  try {
    // Obtener la cadena de conexión desde variables de entorno o configuración
    const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';
    
    const result = await syncService.pushUpdates(
      username,
      connectionString,
      db,
      collection,
      data
    );

    console.log(`[SYNC PUSH] ✓ Guardados: ${result.toUpdate.length} documentos\n`);

    return res.status(200).json(result);
  } catch (error) {
    console.error(`[SYNC PUSH] ✗ Error:`, error.message);
    next(error);
  }
};

/**
 * GET /status
 * Health check del servidor
 */
const getStatus = async (req, res) => {
  console.log('[STATUS] Health check solicitado');
  
  return res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

/**
 * HEAD /
 * Prueba de conexión rápida
 */
const testConnection = async (req, res) => {
  console.log('[TEST] Prueba de conexión');
  return res.status(200).end();
};

/**
 * POST /sync/init-indexes
 * Inicializa los índices de la base de datos
 */
const initIndexes = async (req, res, next) => {
  const { db, collection } = req.body;

  console.log(`\n[INIT INDEXES] Base de datos: ${db}, Colección: ${collection}`);

  try {
    const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';
    
    await syncService.createIndexes(connectionString, db, collection);

    console.log(`[INIT INDEXES] ✓ Índices creados correctamente\n`);

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
  checkSync,
  pushSync,
  getStatus,
  testConnection,
  initIndexes
};