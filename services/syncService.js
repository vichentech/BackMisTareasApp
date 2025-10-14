const { MongoClient } = require('mongodb');

const connectionCache = new Map();

/**
 * Construye la cadena de conexión con credenciales desde variables de entorno
 */
const buildConnectionString = (connectionString) => {
  const username = process.env.MONGO_USERNAME;
  const password = process.env.MONGO_PASSWORD;

  if (!username || !password) {
    console.log('⚠ No se encontraron credenciales de MongoDB en .env, conectando sin autenticación');
    return connectionString;
  }

  try {
    const url = new URL(connectionString);
    const encodedUsername = encodeURIComponent(username);
    const encodedPassword = encodeURIComponent(password);
    url.username = encodedUsername;
    url.password = encodedPassword;
    return url.toString();
  } catch (error) {
    if (connectionString.startsWith('mongodb://') || connectionString.startsWith('mongodb+srv://')) {
      const protocol = connectionString.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
      const withoutProtocol = connectionString.replace(/^mongodb(\+srv)?:\/\//, '');
      const withoutCredentials = withoutProtocol.replace(/^[^@]*@/, '');
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

/**
 * Obtiene o crea una conexión a MongoDB con caché
 */
const getMongoConnection = async (connectionString, dbName) => {
  const cacheKey = generateCacheKey(connectionString, dbName);

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

    if (error.message.includes('Authentication failed') || error.code === 18) {
      throw new Error('Error de autenticación: Usuario o contraseña incorrectos');
    }
    if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      throw new Error('Error de conexión: No se puede alcanzar el servidor MongoDB');
    }
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Error de conexión: MongoDB rechazó la conexión');
    }

    throw new Error(`Error de conexión a MongoDB: ${error.message}`);
  }
};

/**
 * Obtiene la colección de MongoDB
 */
const getCollection = async (connectionString, dbName, collectionName) => {
  const client = await getMongoConnection(connectionString, dbName);
  const db = client.db(dbName);
  return db.collection(collectionName);
};

/**
 * Comprueba qué datos necesita actualizar el cliente
 * @param {string} username - Nombre de usuario
 * @param {string} connectionString - Cadena de conexión a MongoDB
 * @param {string} dbName - Nombre de la base de datos
 * @param {string} collectionName - Nombre de la colección
 * @param {object} clientTimestamps - Objeto con yearMonth como clave y updatedAt como valor
 * @returns {object} SyncResult con toUpdate y conflicts
 */
const checkUpdates = async (username, connectionString, dbName, collectionName, clientTimestamps) => {
  try {
    const collection = await getCollection(connectionString, dbName, collectionName);

    // Buscar todos los documentos del usuario
    const serverDocuments = await collection
      .find({ username: username })
      .toArray();

    console.log(`📊 Encontrados ${serverDocuments.length} documentos en servidor para: ${username}`);

    const toUpdate = [];
    const conflicts = [];

    // Comparar cada documento del servidor con los timestamps del cliente
    for (const serverDoc of serverDocuments) {
      const { yearMonth, updatedAt } = serverDoc;
      const clientTimestamp = clientTimestamps[yearMonth];

      if (!clientTimestamp) {
        // El cliente no tiene este mes, debe descargarlo
        console.log(`📥 Cliente no tiene el mes: ${yearMonth}`);
        toUpdate.push(serverDoc);
      } else {
        // Comparar fechas
        const serverDate = new Date(updatedAt);
        const clientDate = new Date(clientTimestamp);

        if (serverDate > clientDate) {
          // El servidor tiene una versión más reciente
          console.log(`🔄 Servidor tiene versión más reciente de: ${yearMonth}`);
          toUpdate.push(serverDoc);
        } else {
          console.log(`✓ Cliente tiene versión actualizada de: ${yearMonth}`);
        }
      }
    }

    console.log(`✓ Sincronización check completada: ${toUpdate.length} meses a actualizar`);

    return {
      toUpdate,
      conflicts
    };
  } catch (error) {
    console.error('❌ Error en checkUpdates:', error);
    throw new Error(`Error al comprobar actualizaciones: ${error.message}`);
  }
};

/**
 * Guarda los datos enviados por el cliente
 * @param {string} username - Nombre de usuario
 * @param {string} connectionString - Cadena de conexión a MongoDB
 * @param {string} dbName - Nombre de la base de datos
 * @param {string} collectionName - Nombre de la colección
 * @param {array} dataArray - Array de objetos MonthlyUserData
 * @returns {object} SyncResult con los datos guardados y su nueva updatedAt
 */
const pushUpdates = async (username, connectionString, dbName, collectionName, dataArray) => {
  try {
    const collection = await getCollection(connectionString, dbName, collectionName);

    const toUpdate = [];
    const conflicts = [];

    console.log(`📤 Procesando ${dataArray.length} documentos para guardar`);

    // Procesar cada documento
    for (const clientData of dataArray) {
      const { yearMonth } = clientData;

      // IMPORTANTE: Establecer la fecha de actualización del servidor
      const serverTimestamp = new Date().toISOString();

      const dataToSave = {
        ...clientData,
        username: username, // Asegurar que el username sea consistente
        updatedAt: serverTimestamp // Sobrescribir con la fecha del servidor
      };

      // Realizar upsert
      const result = await collection.replaceOne(
        { username: username, yearMonth: yearMonth },
        dataToSave,
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`✓ Documento creado: ${username} - ${yearMonth}`);
      } else if (result.modifiedCount > 0) {
        console.log(`✓ Documento actualizado: ${username} - ${yearMonth}`);
      } else {
        console.log(`⚠ Sin cambios: ${username} - ${yearMonth}`);
      }

      // Devolver el documento con la nueva fecha del servidor
      toUpdate.push(dataToSave);
    }

    console.log(`✓ Push completado: ${toUpdate.length} documentos procesados`);

    return {
      toUpdate,
      conflicts
    };
  } catch (error) {
    console.error('❌ Error en pushUpdates:', error);
    throw new Error(`Error al guardar actualizaciones: ${error.message}`);
  }
};

/**
 * Crea índices únicos en la colección
 */
const createIndexes = async (connectionString, dbName, collectionName) => {
  try {
    const collection = await getCollection(connectionString, dbName, collectionName);

    // Índice único compuesto
    await collection.createIndex(
      { username: 1, yearMonth: 1 },
      { unique: true, name: 'username_yearMonth_unique' }
    );

    // Índice simple en username
    await collection.createIndex(
      { username: 1 },
      { name: 'username_index' }
    );

    console.log('✓ Índices creados correctamente');
    return true;
  } catch (error) {
    if (error.code === 85 || error.code === 86) {
      console.log('⚠ Los índices ya existen');
      return true;
    }
    console.error('❌ Error al crear índices:', error);
    throw new Error(`Error al crear índices: ${error.message}`);
  }
};

module.exports = {
  checkUpdates,
  pushUpdates,
  createIndexes
};