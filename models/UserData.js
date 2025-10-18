const { MongoClient } = require('mongodb');

/**
 * Modelo de Datos de Usuario para MongoDB
 * Gestiona la colección de datos mensuales de usuarios
 */
class UserData {
  constructor() {
    this.connectionString = process.env.MONGO_CONNECTION_STRING;
    this.dbName = process.env.MONGO_DB_NAME || 'timeTrackingDB';
    this.collectionName = process.env.MONGO_COLLECTION_NAME || 'monthlyData';
  }

  /**
   * Construye la cadena de conexión con credenciales
   */
  buildConnectionString() {
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;

    if (!username || !password) {
      return this.connectionString;
    }

    try {
      const url = new URL(this.connectionString);
      url.username = encodeURIComponent(username);
      url.password = encodeURIComponent(password);
      return url.toString();
    } catch (error) {
      const protocol = this.connectionString.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
      const withoutProtocol = this.connectionString.replace(/^mongodb(\+srv)?:\/\//, '');
      const withoutCredentials = withoutProtocol.replace(/^[^@]*@/, '');
      return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${withoutCredentials}`;
    }
  }

  /**
   * Obtiene la conexión a MongoDB
   */
  async getConnection() {
    const finalConnectionString = this.buildConnectionString();

    const client = new MongoClient(finalConnectionString, {
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_TIMEOUT) || 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    return client;
  }

  /**
   * Obtiene la colección de datos de usuario
   */
  async getCollection() {
    const client = await this.getConnection();
    const db = client.db(this.dbName);
    return { collection: db.collection(this.collectionName), client };
  }

  /**
   * Obtiene los timestamps de todos los meses de un usuario
   * @param {string} username - Nombre de usuario
   * @returns {object} Objeto con yearMonth como clave y updatedAt como valor
   */
  async getTimestamps(username) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      // Buscar todos los documentos del usuario, proyectando solo yearMonth y updatedAt
      const documents = await collection
        .find(
          { username: username },
          { projection: { yearMonth: 1, updatedAt: 1, _id: 0 } }
        )
        .toArray();

      // Construir el objeto de timestamps
      const timestamps = {};
      documents.forEach(doc => {
        if (doc.yearMonth && doc.updatedAt) {
          timestamps[doc.yearMonth] = doc.updatedAt;
        }
      });

      return {
        success: true,
        found: documents.length > 0,
        timestamps
      };
    } catch (error) {
      console.error('Error al obtener timestamps:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Verifica si un usuario existe en la base de datos
   * @param {string} username - Nombre de usuario
   * @returns {boolean} true si el usuario existe
   */
  async userExists(username) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const count = await collection.countDocuments({ username: username }, { limit: 1 });
      return count > 0;
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }
}

module.exports = new UserData();