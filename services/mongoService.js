const { MongoClient } = require('mongodb');

const connectionCache = new Map();

/**
 * Construye la cadena de conexión con credenciales desde variables de entorno
 */
const buildConnectionString = (connectionString) => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;

  // Si no hay credenciales configuradas, retornar la cadena original
  if (!username || !password) {
    console.log('⚠ No se encontraron credenciales de MongoDB en .env, conectando sin autenticación');
    return connectionString;
  }

  try {
    const url = new URL(connectionString);
    
    // Codificar las credenciales para manejar caracteres especiales
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    
    // Si la URL ya tiene credenciales, las reemplazamos con las del .env
    url.username = encodedUsername;
    url.password = encodedPassword;
    
    return url.toString();
  } catch (error) {
    // Si no es una URL válida, intentar formato mongodb://
    if (connectionString.startsWith('mongodb://') || connectionString.startsWith('mongodb+srv://')) {
      const protocol = connectionString.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
      const withoutProtocol = connectionString.replace(/^mongodb(\+srv)?:\/\//, '');
      
      // Remover credenciales existentes si las hay
      const withoutCredentials = withoutProtocol.replace(/^[^@]*@/, '');
      
      // Codificar credenciales
      const encodedUsername = encodeURIComponent(username);
      const encodedPassword = encodeURIComponent(password);
      
      return `${protocol}${encodedUsername}:${encodedPassword}@${withoutCredentials}`;
    }
    
    throw new Error('Formato de connectionString no válido');
  }
};

/**
 * Genera una clave de caché única para la conexión
 */
const generateCacheKey = (connectionString, dbName) => {
  return `${connectionString}_${dbName}`;
};

const getMongoConnection = async (connectionString, dbName) => {
  const cacheKey = generateCacheKey(connectionString, dbName);

  // Verificar si existe una conexión en caché y si está activa
  if (connectionCache.has(cacheKey)) {
    const cachedClient = connectionCache.get(cacheKey);
    try {
      await cachedClient.db().admin().ping();
      console.log(`✓ Reutilizando conexión en caché: ${dbName}`);
      return cachedClient;
    } catch (error) {
      console.log('⚠ Conexión en cache inválida, creando nueva...');
      connectionCache.delete(cacheKey);
    }
  }

  // Construir la cadena de conexión con credenciales del .env
  const finalConnectionString = buildConnectionString(connectionString);

  const client = new MongoClient(finalConnectionString, {
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_TIMEOUT) || 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  try {
    await client.connect();
    const authInfo = process.env.MONGO_USERNAME ? ` (autenticado como: ${process.env.MONGO_USERNAME})` : '';
    console.log(`✓ Conexión establecida con MongoDB: ${dbName}${authInfo}`);
    
    connectionCache.set(cacheKey, client);
    
    // Limpiar caché después de 5 minutos de inactividad
    setTimeout(() => {
      if (connectionCache.has(cacheKey)) {
        connectionCache.get(cacheKey).close();
        connectionCache.delete(cacheKey);
        console.log(`🧹 Cache de conexión limpiado: ${dbName}`);
      }
    }, 5 * 60 * 1000);

    return client;
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    
    // Proporcionar mensajes de error más específicos
    if (error.message.includes('Authentication failed') || error.code === 18) {
      throw new Error('Error de autenticación: Usuario o contraseña incorrectos. Verifica las credenciales en .env');
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      throw new Error('Error de conexión: No se puede alcanzar el servidor MongoDB');
    }
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Error de conexión: MongoDB rechazó la conexión. Verifica que el servidor esté activo');
    }
    
    throw new Error(`Error de conexión a MongoDB: ${error.message}`);
  }
};

/**
 * Obtiene las marcas de tiempo de actualización de todos los meses de un usuario
 * @param {string} username - Nombre de usuario
 * @param {object} config - Configuración de conexión {connectionString, dbName, collectionName}
 * @returns {Array} Array de objetos {yearMonth, updatedAt}
 */
const getUserUpdates = async (username, config) => {
  const { connectionString, dbName, collectionName } = config;

  try {
    const client = await getMongoConnection(connectionString, dbName);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Buscar todos los documentos del usuario y proyectar solo yearMonth y updatedAt
    const updates = await collection
      .find({ username: username })
      .project({ yearMonth: 1, updatedAt: 1, _id: 0 })
      .toArray();
    
    console.log(`✓ Encontrados ${updates.length} meses para usuario: ${username}`);
    return updates;
  } catch (error) {
    console.error('❌ Error en getUserUpdates:', error);
    throw new Error(`Error al obtener actualizaciones del usuario: ${error.message}`);
  }
};

/**
 * Obtiene los datos completos de un mes específico para un usuario
 * @param {string} username - Nombre de usuario
 * @param {string} yearMonth - Año y mes en formato AAAA-MM
 * @param {object} config - Configuración de conexión {connectionString, dbName, collectionName}
 * @returns {object|null} Documento MonthlyUserData completo o null si no existe
 */
const getMonthData = async (username, yearMonth, config) => {
  const { connectionString, dbName, collectionName } = config;

  try {
    const client = await getMongoConnection(connectionString, dbName);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const monthData = await collection.findOne({ 
      username: username, 
      yearMonth: yearMonth 
    });
    
    if (monthData) {
      console.log(`✓ Datos encontrados para ${username} - ${yearMonth}`);
    } else {
      console.log(`⚠ No se encontraron datos para ${username} - ${yearMonth}`);
    }
    
    return monthData;
  } catch (error) {
    console.error('❌ Error en getMonthData:', error);
    throw new Error(`Error al obtener datos del mes: ${error.message}`);
  }
};

/**
 * Guarda o actualiza los datos de un mes completo para un usuario
 * @param {object} monthData - Objeto MonthlyUserData completo
 * @param {object} config - Configuración de conexión {connectionString, dbName, collectionName}
 * @returns {object} Resultado de la operación
 */
const saveMonthData = async (monthData, config) => {
  const { connectionString, dbName, collectionName } = config;
  const { username, yearMonth } = monthData;

  if (!username || !yearMonth) {
    throw new Error('Los campos username y yearMonth son requeridos en monthData');
  }

  try {
    const client = await getMongoConnection(connectionString, dbName);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Actualizar el campo updatedAt con la fecha actual del servidor
    const dataToSave = {
      ...monthData,
      updatedAt: new Date().toISOString()
    };
    
    // Realizar upsert basado en username y yearMonth
    const result = await collection.replaceOne(
      { username: username, yearMonth: yearMonth },
      dataToSave,
      { upsert: true }
    );
    
    console.log(`✓ Datos guardados para ${username} - ${yearMonth}`);
    return result;
  } catch (error) {
    console.error('❌ Error en saveMonthData:', error);
    throw new Error(`Error al guardar datos del mes: ${error.message}`);
  }
};

/**
 * Crea índices únicos en la colección para optimizar búsquedas
 * @param {object} config - Configuración de conexión {connectionString, dbName, collectionName}
 */
const createIndexes = async (config) => {
  const { connectionString, dbName, collectionName } = config;

  try {
    const client = await getMongoConnection(connectionString, dbName);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Crear índice único compuesto por username y yearMonth
    await collection.createIndex(
      { username: 1, yearMonth: 1 }, 
      { unique: true, name: 'username_yearMonth_unique' }
    );
    
    // Crear índice simple en username para búsquedas rápidas
    await collection.createIndex(
      { username: 1 }, 
      { name: 'username_index' }
    );
    
    console.log('✓ Índices creados correctamente');
  } catch (error) {
    // Si el índice ya existe, no es un error crítico
    if (error.code === 85 || error.code === 86) {
      console.log('⚠ Los índices ya existen');
    } else {
      console.error('❌ Error al crear índices:', error);
      throw new Error(`Error al crear índices: ${error.message}`);
    }
  }
};

// Mantener las funciones antiguas para compatibilidad
const getUserData = async (username, config) => {
  const { connectionString, dbName, collectionName } = config;

  try {
    const client = await getMongoConnection(connectionString, dbName);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const userData = await collection.findOne({ username: username });
    return userData;
  } catch (error) {
    console.error('❌ Error en getUserData:', error);
    throw new Error(`Error al obtener datos del usuario: ${error.message}`);
  }
};

const saveUserData = async (userData, config) => {
  const { connectionString, dbName, collectionName } = config;
  const username = userData.username;

  try {
    const client = await getMongoConnection(connectionString, dbName);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const result = await collection.replaceOne(
      { username: username },
      userData,
      { upsert: true }
    );
    return result;
  } catch (error) {
    console.error('❌ Error en saveUserData:', error);
    throw new Error(`Error al guardar datos del usuario: ${error.message}`);
  }
};

module.exports = {
  getUserData,
  saveUserData,
  getUserUpdates,
  getMonthData,
  saveMonthData,
  createIndexes
};