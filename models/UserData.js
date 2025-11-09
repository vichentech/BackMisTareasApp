const { MongoClient } = require("mongodb");

/**
 * Modelo de Datos de Usuario para MongoDB
 * Gestiona la colección de datos mensuales de usuarios
 */
class UserData {
  constructor() {
    this.connectionString = process.env.MONGO_CONNECTION_STRING;
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
      const protocol = this.connectionString.startsWith("mongodb+srv://")
        ? "mongodb+srv://"
        : "mongodb://";
      const withoutProtocol = this.connectionString.replace(
        /^mongodb(\+srv)?:\/\//,
        ""
      );
      const withoutCredentials = withoutProtocol.replace(/^[^@]*@/, "");
      return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(
        password
      )}@${withoutCredentials}`;
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
  async getCollection(dbName, collectionName) {
    const client = await this.getConnection();
    const db = client.db(dbName);
    return { collection: db.collection(collectionName), client };
  }

  /**
   * Obtiene los timestamps de todos los meses de un usuario
   * @param {string} username - Nombre de usuario
   * @param {string} dbName - Nombre de la base de datos
   * @param {string} collectionName - Nombre de la colección
   * @returns {object} Objeto con yearMonth como clave y updatedAt como valor
   */
  async getTimestamps(username, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Buscando timestamps para: ${username}`);
      console.log(`[UserData] Base de datos: ${dbName}`);
      console.log(`[UserData] Colección: ${collectionName}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      // Buscar todos los documentos del usuario, proyectando solo yearMonth y updatedAt
      const documents = await collection
        .find(
          { username: username },
          { projection: { yearMonth: 1, updatedAt: 1, _id: 0 } }
        )
        .toArray();

      console.log(`[UserData] Documentos encontrados: ${documents.length}`);

      // Construir el objeto de timestamps
      const timestamps = {};
      documents.forEach((doc) => {
        if (doc.yearMonth && doc.updatedAt) {
          timestamps[doc.yearMonth] = doc.updatedAt;
        }
      });

      console.log(
        `[UserData] Timestamps construidos: ${Object.keys(timestamps).length}`
      );

      return {
        success: true,
        found: documents.length > 0,
        timestamps,
      };
    } catch (error) {
      console.error("[UserData] Error al obtener timestamps:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Obtiene los datos completos de meses específicos de un usuario
   * @param {string} username - Nombre de usuario
   * @param {Array<string>} months - Array de meses en formato YYYY-MM
   * @param {string} dbName - Nombre de la base de datos
   * @param {string} collectionName - Nombre de la colección
   * @returns {Array} Array de documentos con los datos mensuales
   */
  async getMonthsData(username, months, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Obteniendo datos de meses para: ${username}`);
      console.log(`[UserData] Meses solicitados: ${months.join(", ")}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      // Buscar los documentos de los meses solicitados
      const documents = await collection
        .find({
          username: username,
          yearMonth: { $in: months },
        })
        .toArray();

      console.log(`[UserData] Documentos encontrados: ${documents.length}`);

      // Transformar los documentos al formato esperado
      const data = documents.map((doc) => ({
        username: doc.username,
        yearMonth: doc.yearMonth,
        updatedAt: doc.updatedAt,
        monthData: doc.monthData || {},
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("[UserData] Error al obtener datos de meses:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Actualiza o inserta los datos de meses específicos de un usuario
   * @param {string} username - Nombre de usuario
   * @param {Array<object>} monthsData - Array de objetos con datos mensuales
   * @param {string} dbName - Nombre de la base de datos
   * @param {string} collectionName - Nombre de la colección
   * @returns {object} Resultado de la operación
   */
  async updateMonthsData(username, monthsData, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Actualizando datos de meses para: ${username}`);
      console.log(`[UserData] Meses a actualizar: ${monthsData.length}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      const bulkOps = [];
      const conflicts = [];

      for (const monthData of monthsData) {
        // Validar que el username coincide
        if (monthData.username !== username) {
          conflicts.push({
            yearMonth: monthData.yearMonth,
            reason: "Username no coincide",
          });
          continue;
        }

        // Verificar si existe el documento
        const existing = await collection.findOne({
          username: username,
          yearMonth: monthData.yearMonth,
        });

        // Si existe, verificar conflictos de versión
        if (existing && existing.updatedAt) {
          const existingDate = new Date(existing.updatedAt);
          const newDate = new Date(monthData.updatedAt);

          // Si la versión del servidor es más nueva, hay conflicto
          if (existingDate > newDate) {
            conflicts.push({
              yearMonth: monthData.yearMonth,
              reason: "Versión del servidor más reciente",
              serverUpdatedAt: existing.updatedAt,
              clientUpdatedAt: monthData.updatedAt,
            });
            continue;
          }
        }

        // Preparar operación de actualización
        bulkOps.push({
          updateOne: {
            filter: {
              username: username,
              yearMonth: monthData.yearMonth,
            },
            update: {
              $set: {
                username: username,
                yearMonth: monthData.yearMonth,
                updatedAt: monthData.updatedAt,
                monthData: monthData.monthData,
              },
            },
            upsert: true,
          },
        });
      }

      // Ejecutar operaciones en bulk si hay alguna
      let writeResult = null;
      if (bulkOps.length > 0) {
        writeResult = await collection.bulkWrite(bulkOps);
        console.log(`[UserData] Operaciones ejecutadas: ${bulkOps.length}`);
        console.log(`[UserData] Insertados: ${writeResult.upsertedCount}`);
        console.log(`[UserData] Modificados: ${writeResult.modifiedCount}`);
      }

      return {
        success: true,
        modified: writeResult ? writeResult.modifiedCount : 0,
        inserted: writeResult ? writeResult.upsertedCount : 0,
        conflicts: conflicts,
      };
    } catch (error) {
      console.error("[UserData] Error al actualizar datos de meses:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  /**
   * Verifica si un usuario existe en la base de datos
   * @param {string} username - Nombre de usuario
   * @param {string} dbName - Nombre de la base de datos
   * @param {string} collectionName - Nombre de la colección
   * @returns {boolean} true si el usuario existe
   */
  async userExists(username, dbName, collectionName) {
    let client;
    try {
      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      const count = await collection.countDocuments(
        { username: username },
        { limit: 1 }
      );
      return count > 0;
    } catch (error) {
      console.error("[UserData] Error al verificar usuario:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  async getLockedDays(username, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Buscando días bloqueados para: ${username}`);
      console.log(`[UserData] Base de datos: ${dbName}`);
      console.log(`[UserData] Colección: ${collectionName}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      const documents = await collection
        .find(
          { username: username },
          { projection: { yearMonth: 1, monthData: 1, _id: 0 } }
        )
        .toArray();

      console.log(`[UserData] Documentos encontrados: ${documents.length}`);

      const lockedDays = [];

      documents.forEach((doc) => {
        if (
          doc.monthData &&
          doc.monthData.days &&
          Array.isArray(doc.monthData.days)
        ) {
          doc.monthData.days.forEach((day) => {
            if ((day.al === true || day.ma === true) && day.d) {
              lockedDays.push(day.d);
            }
          });
        }
      });

      console.log(
        `[UserData] Días bloqueados encontrados: ${lockedDays.length}`
      );

      return {
        success: true,
        lockedDays: lockedDays.sort(),
      };
    } catch (error) {
      console.error("[UserData] Error al obtener días bloqueados:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  async getDayTimestamps(username, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Obteniendo timestamps de días para: ${username}`);
      console.log(`[UserData] Base de datos: ${dbName}`);
      console.log(`[UserData] Colección: ${collectionName}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      const documents = await collection
        .find({ username: username }, { projection: { monthData: 1, _id: 0 } })
        .toArray();

      console.log(`[UserData] Documentos encontrados: ${documents.length}`);

      const dayTimestamps = {};

      documents.forEach((doc) => {
        if (
          doc.monthData &&
          doc.monthData.days &&
          Array.isArray(doc.monthData.days)
        ) {
          doc.monthData.days.forEach((day) => {
            if (day.d && day.ts) {
              dayTimestamps[day.d] = {
                ts: day.ts,
                isLocked: day.al === true || day.ma === true,
              };
            }
          });
        }
      });

      console.log(
        `[UserData] Días con timestamp encontrados: ${
          Object.keys(dayTimestamps).length
        }`
      );

      return {
        success: true,
        dayTimestamps,
      };
    } catch (error) {
      console.error("[UserData] Error al obtener timestamps de días:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  async uploadDays(username, daysData, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Subiendo días para: ${username}`);
      console.log(`[UserData] Días a subir: ${daysData.length}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      let uploaded = 0;
      let skipped = 0;

      for (const dayData of daysData) {
        if (!dayData.d) {
          console.log(`[UserData] Día sin fecha, omitiendo`);
          skipped++;
          continue;
        }

        const yearMonth = dayData.d.substring(0, 7);

        dayData.ts = Date.now();

        const updateResult = await collection.updateOne(
          {
            username: username,
            yearMonth: yearMonth,
            "monthData.days.d": dayData.d,
            "monthData.days.al": { $ne: true },
            "monthData.days.ma": { $ne: true },
          },
          {
            $set: {
              "monthData.days.$": dayData,
              updatedAt: new Date(),
            },
          }
        );

        if (updateResult.matchedCount === 0) {
          const doc = await collection.findOne({
            username: username,
            yearMonth: yearMonth,
          });

          if (!doc) {
            await collection.insertOne({
              username: username,
              yearMonth: yearMonth,
              monthData: { days: [dayData] },
              updatedAt: new Date(),
            });
            uploaded++;
          } else {
            const dayExists = doc.monthData?.days?.some(
              (d) => d.d === dayData.d
            );

            if (dayExists) {
              const isLocked = doc.monthData.days.find(
                (d) => d.d === dayData.d && (d.al === true || d.ma === true)
              );
              if (isLocked) {
                console.log(
                  `[UserData] Día ${dayData.d} está bloqueado, omitiendo`
                );
                skipped++;
                continue;
              }
            }

            await collection.updateOne(
              {
                username: username,
                yearMonth: yearMonth,
              },
              {
                $push: { "monthData.days": dayData },
                $set: { updatedAt: new Date() },
              }
            );
            uploaded++;
          }
        } else {
          uploaded++;
        }
      }

      console.log(`[UserData] Días subidos: ${uploaded}, omitidos: ${skipped}`);

      return {
        success: true,
        uploaded,
        skipped,
      };
    } catch (error) {
      console.error("[UserData] Error al subir días:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }

  async downloadDays(username, dates, dbName, collectionName) {
    let client;
    try {
      console.log(`[UserData] Descargando días para: ${username}`);
      console.log(`[UserData] Fechas solicitadas: ${dates.length}`);

      const result = await this.getCollection(dbName, collectionName);
      client = result.client;
      const collection = result.collection;

      const yearMonths = [
        ...new Set(dates.map((date) => date.substring(0, 7))),
      ];

      const documents = await collection
        .find(
          {
            username: username,
            yearMonth: { $in: yearMonths },
          },
          { projection: { monthData: 1, _id: 0 } }
        )
        .toArray();

      console.log(`[UserData] Documentos encontrados: ${documents.length}`);

      const daysData = [];

      documents.forEach((doc) => {
        if (
          doc.monthData &&
          doc.monthData.days &&
          Array.isArray(doc.monthData.days)
        ) {
          doc.monthData.days.forEach((day) => {
            if (day.d && dates.includes(day.d)) {
              daysData.push(day);
            }
          });
        }
      });

      console.log(`[UserData] Días encontrados: ${daysData.length}`);

      return {
        success: true,
        data: daysData,
      };
    } catch (error) {
      console.error("[UserData] Error al descargar días:", error);
      throw error;
    } finally {
      if (client) await client.close();
    }
  }
}

module.exports = new UserData();
