const { MongoClient } = require('mongodb');

class UserList {
  constructor() {
    this.collectionName = 'userlists';
    this.dbName = process.env.AUTH_DB_NAME || 'authDB';
  }

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

  async getCollection() {
    const client = await this.getConnection();
    const db = client.db(this.dbName);
    return { collection: db.collection(this.collectionName), client };
  }

  async findByUsername(username) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const userList = await collection.findOne({ username });
      
      if (!userList) {
        return {
          username,
          updatedAt: new Date('1970-01-01T00:00:00.000Z'),
          projects: [],
          mainTasks: [],
          vehicles: []
        };
      }

      return userList;
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async upsert(username, listsData) {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      const now = new Date();
      
      const updateData = {
        username,
        updatedAt: now,
        projects: listsData.projects || [],
        mainTasks: listsData.mainTasks || [],
        vehicles: listsData.vehicles || []
      };

      await collection.updateOne(
        { username },
        { $set: updateData },
        { upsert: true }
      );

      return {
        success: true,
        updatedAt: now.toISOString()
      };
    } finally {
      if (client) {
        await client.close();
      }
    }
  }

  async createIndexes() {
    let client;
    try {
      const result = await this.getCollection();
      client = result.client;
      const collection = result.collection;

      await collection.createIndex({ username: 1 }, { unique: true });
      
      return { success: true, message: 'Índices creados correctamente' };
    } finally {
      if (client) {
        await client.close();
      }
    }
  }
}

module.exports = new UserList();
