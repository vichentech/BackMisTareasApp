const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

/**
 * Modelo de Listas Maestras para MongoDB
 * Gestiona la colección 'config' en la base de datos de autenticación
 */
class MasterList {
  constructor() {
    this.collectionName = 'config';
    this.dbName = process.env.AUTH_DB_NAME || 'authDB';
    this.documentId = 'master_lists';
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
   * Obtiene la colección de configuración
   */
  async getCollection() {
    const client = await this.getConnection();
    const db = client.db(this.dbName);
    return { collection: db.collection(this.collectionName), client };
  }

  /**
   * Obtiene las listas maestras
   */

async getMasterLists() {
  let client;
  try {
    const result = await this.getCollection();
    client = result.client;
    const collection = result.collection;

    const masterLists = await collection.findOne({ _id: this.documentId });

    if (!masterLists) {
      const defaultLists = {
        _id: this.documentId,
        projects: [
          { id: uuidv4(), pnr: 'PROJ-001', pnm: 'Proyecto Principal' },
          { id: uuidv4(), pnr: 'PROJ-002', pnm: 'Proyecto Secundario' }
        ],
        mainTasks: [
          { id: uuidv4(), name: 'Mantenimiento General' },
          { id: uuidv4(), name: 'Revisión de Problemas' },
          { id: uuidv4(), name: 'Desarrollo de Funcionalidades' }
        ],
        vehicles: [
          { id: uuidv4(), name: 'Furgoneta-01' },
          { id: uuidv4(), name: 'Furgoneta-02' },
          { id: uuidv4(), name: 'Camión-01' }
        ],
        otherWorkTypes: [
          { id: uuidv4(), name: 'Asuntos Propios' },
          { id: uuidv4(), name: 'Visita Médica' },
          { id: uuidv4(), name: 'Formación' },
          { id: uuidv4(), name: 'Vacaciones' },
          { id: uuidv4(), name: 'Baja Médica' }
        ],
        companyHolidays: [],
        updatedAt: new Date()
      };

      await collection.insertOne(defaultLists);
      return defaultLists;
    }

    if (!masterLists.otherWorkTypes) {
      masterLists.otherWorkTypes = [
        { id: uuidv4(), name: 'Asuntos Propios' },
        { id: uuidv4(), name: 'Visita Médica' },
        { id: uuidv4(), name: 'Formación' },
        { id: uuidv4(), name: 'Vacaciones' },
        { id: uuidv4(), name: 'Baja Médica' }
      ];
    }

    if (!masterLists.companyHolidays) {
      masterLists.companyHolidays = [];
    }

    return masterLists;
  } catch (error) {
    console.error('Error al obtener listas maestras:', error);
    throw error;
  } finally {
    if (client) await client.close();
  }
}


  /**
   * Actualiza las listas maestras
   */

async updateMasterLists(projects, mainTasks, vehicles, otherWorkTypes, companyHolidays) {
  let client;
  try {
    const result = await this.getCollection();
    client = result.client;
    const collection = result.collection;

    const updatedLists = {
      _id: this.documentId,
      projects: projects || [],
      mainTasks: mainTasks || [],
      vehicles: vehicles || [],
      otherWorkTypes: otherWorkTypes || [],
      companyHolidays: companyHolidays || [],
      updatedAt: new Date()
    };

    const updateResult = await collection.replaceOne(
      { _id: this.documentId },
      updatedLists,
      { upsert: true }
    );

    return {
      success: true,
      modified: updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0,
      data: updatedLists
    };
  } catch (error) {
    console.error('Error al actualizar listas maestras:', error);
    throw error;
  } finally {
    if (client) await client.close();
  }
}


  /**
   * Inicializa las listas maestras con valores por defecto
   */

async initializeMasterLists() {
  let client;
  try {
    const result = await this.getCollection();
    client = result.client;
    const collection = result.collection;
    
    const existing = await collection.findOne({ _id: this.documentId });
    if (existing) {
      return {
        success: true,
        message: 'Las listas maestras ya están inicializadas',
        data: {
          projects: existing.projects || [],
          mainTasks: existing.mainTasks || [],
          vehicles: existing.vehicles || [],
          otherWorkTypes: existing.otherWorkTypes || [
            { id: uuidv4(), name: 'Asuntos Propios' },
            { id: uuidv4(), name: 'Visita Médica' },
            { id: uuidv4(), name: 'Formación' },
            { id: uuidv4(), name: 'Vacaciones' },
            { id: uuidv4(), name: 'Baja Médica' }
          ],
          companyHolidays: existing.companyHolidays || [],
          updatedAt: existing.updatedAt
        }
      };
    }

    const defaultLists = {
      _id: this.documentId,
      projects: [
        { id: uuidv4(), pnr: 'PROJ-001', pnm: 'Proyecto Principal' },
        { id: uuidv4(), pnr: 'PROJ-002', pnm: 'Proyecto Secundario' },
        { id: uuidv4(), pnr: 'PROJ-003', pnm: 'Proyecto de Mantenimiento' }
      ],
      mainTasks: [
        { id: uuidv4(), name: 'Mantenimiento General' },
        { id: uuidv4(), name: 'Revisión de Problemas' },
        { id: uuidv4(), name: 'Desarrollo de Funcionalidades' },
        { id: uuidv4(), name: 'Reuniones' },
        { id: uuidv4(), name: 'Documentación' }
      ],
      vehicles: [
        { id: uuidv4(), name: 'Furgoneta-01' },
        { id: uuidv4(), name: 'Furgoneta-02' },
        { id: uuidv4(), name: 'Camión-01' },
        { id: uuidv4(), name: 'Camión-02' }
      ],
      otherWorkTypes: [
        { id: uuidv4(), name: 'Asuntos Propios' },
        { id: uuidv4(), name: 'Visita Médica' },
        { id: uuidv4(), name: 'Formación' },
        { id: uuidv4(), name: 'Vacaciones' },
        { id: uuidv4(), name: 'Baja Médica' },
        { id: uuidv4(), name: 'Permiso' },
        { id: uuidv4(), name: 'Teletrabajo' }
      ],
      companyHolidays: [],
      updatedAt: new Date()
    };

    await collection.insertOne(defaultLists);

    return {
      success: true,
      message: 'Listas maestras inicializadas correctamente',
      data: {
        projects: defaultLists.projects,
        mainTasks: defaultLists.mainTasks,
        vehicles: defaultLists.vehicles,
        otherWorkTypes: defaultLists.otherWorkTypes,
        companyHolidays: defaultLists.companyHolidays,
        updatedAt: defaultLists.updatedAt
      }
    };
  } catch (error) {
    console.error('Error al inicializar listas maestras:', error);
    throw error;
  } finally {
    if (client) await client.close();
  }
}


}

module.exports = new MasterList();