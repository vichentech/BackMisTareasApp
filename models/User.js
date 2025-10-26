const { MongoClient, ObjectId } = require('mongodb');

/**
 * Modelo de Usuario para MongoDB
 * Gestiona la colección 'users' en la base de datos de autenticación
 */
class User {
  constructor() {
    this.collectionName = 'users';
    this.dbName = process.env.AUTH_DB_NAME || 'authDB';
  }

  /**
   * Obtiene la conexión a MongoDB
   */
  async getConnection() {
    const connectionString = process.env.MONGO_CONNECTION_STRING;
    const username = process.env.MONGO_USERNAME;
    const password = process.env.MONGO_PASSWORD;

    let finalConnectionString = connectionString;

    if (username && password) {
      try {
        const url = new URL(connectionString);
        url.username = encodeURIComponent(username);
        url.password = encodeURIComponent(password);
        finalConnectionString = url.toString();
      } catch (error) {
        const protocol = connectionString.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
        const withoutProtocol = connectionString.replace(/^mongodb(\+srv)?:\/\//, '');
        const withoutCredentials = withoutProtocol.replace(/^[^@]*@/, '');
        finalConnectionString = `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@${withoutCredentials}`;
      }
    }

    const client = new MongoClient(finalConnectionString, {
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_TIMEOUT) || 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    return client;
  }

  /**
   * Obtiene la colección de usuarios
   */
  async getCollection() {
    const client = await this.getConnection();
    const db = client.db(this.dbName);
    return { collection: db.collection(this.collectionName), client };
  }

  /**
   * Inicializa los índices de la colección
   */
  async initializeIndexes() {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      // Crear índice único en username
      await collection.createIndex({ username: 1 }, { unique: true });
      console.log('✓ Índice único creado en campo "username"');

      return { success: true, message: 'Índices inicializados correctamente' };
    } catch (error) {
      console.error('Error al inicializar índices:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Busca un usuario por username
   */
  async findByUsername(username) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const user = await collection.findOne({ username });
      return user;
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async create(userData) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const newUser = {
        username: userData.username,
        passwordHash: userData.passwordHash,
        role: userData.role || 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const insertResult = await collection.insertOne(newUser);
      return { ...newUser, _id: insertResult.insertedId };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('USERNAME_EXISTS');
      }
      console.error('Error al crear usuario:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }


  /**
   * Obtiene todos los usuarios con username y role
   */
  async getAllUsersWithRoles() {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const users = await collection
        .find({}, { projection: { username: 1, role: 1, _id: 0 } })
        .sort({ username: 1 })
        .toArray();

      return users.map(user => ({
        username: user.username,
        role: user.role || 'user'
      }));
    } catch (error) {
      console.error('Error al obtener usuarios con roles:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Obtiene todos los usuarios (solo usernames) - DEPRECATED
   * Mantener por compatibilidad
   */
  async getAllUsernames() {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const users = await collection
        .find({}, { projection: { username: 1, _id: 0 } })
        .toArray();

      return users.map(user => user.username);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }


  /**
   * Actualiza la contraseña de un usuario
   */
  async updatePassword(username, newPasswordHash) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const updateResult = await collection.updateOne(
        { username },
        {
          $set: {
            passwordHash: newPasswordHash,
            updatedAt: new Date()
          }
        }
      );

      return updateResult.modifiedCount > 0;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Elimina un usuario
   */
  async delete(username) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const deleteResult = await collection.deleteOne({ username });
      return deleteResult.deletedCount > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }
}

module.exports = new User();