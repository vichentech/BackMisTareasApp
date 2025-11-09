const { MongoClient } = require("mongodb");
const UserData = require("../models/UserData");
const User = require("../models/User");

/**
 * Servicio de Datos de Usuario
 * Contiene la lógica de negocio para operaciones con datos de usuario
 */
class DataService {
  /**
   * Obtiene los timestamps de todos los meses de un usuario
   */
  async getTimestamps(username, dbName = null, collectionName = null) {
    try {
      // Usar valores por defecto si no se proporcionan
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(
        `[DataService] Obteniendo timestamps para usuario: ${username}`
      );
      console.log(
        `[DataService] DB: ${targetDb}, Collection: ${targetCollection}`
      );

      // Usar el método correcto del modelo UserData
      const result = await UserData.getTimestamps(
        username,
        targetDb,
        targetCollection
      );

      if (!result.success) {
        console.log(`[DataService] Error al obtener timestamps del modelo`);
        return {
          success: false,
          message: "Error al obtener timestamps",
          timestamps: {},
          statusCode: 500,
        };
      }

      if (!result.found) {
        console.log(
          `[DataService] No se encontraron documentos para el usuario: ${username}`
        );
        return {
          success: true,
          message: "No se encontraron datos para este usuario",
          timestamps: {},
          statusCode: 200,
        };
      }

      console.log(
        `[DataService] Timestamps encontrados: ${
          Object.keys(result.timestamps).length
        }`
      );

      return {
        success: true,
        message: "Timestamps obtenidos correctamente",
        timestamps: result.timestamps,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error al obtener timestamps:", error);
      return {
        success: false,
        message: "Error al obtener timestamps: " + error.message,
        timestamps: {},
        statusCode: 500,
      };
    }
  }

  /**
   * Obtiene los datos completos de meses específicos de un usuario
   */
  async getMonthsData(username, months, dbName = null, collectionName = null) {
    try {
      // Validar entrada
      if (!Array.isArray(months) || months.length === 0) {
        return {
          success: false,
          message: "El array de meses es requerido y no puede estar vacío",
          data: [],
          statusCode: 400,
        };
      }

      // Validar formato de meses (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      const invalidMonths = months.filter((m) => !monthRegex.test(m));
      if (invalidMonths.length > 0) {
        return {
          success: false,
          message: `Formato de mes inválido: ${invalidMonths.join(
            ", "
          )}. Use YYYY-MM`,
          data: [],
          statusCode: 400,
        };
      }

      // Usar valores por defecto si no se proporcionan
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(
        `[DataService] Obteniendo datos de meses para usuario: ${username}`
      );
      console.log(`[DataService] Meses: ${months.join(", ")}`);

      // Obtener datos del modelo
      const result = await UserData.getMonthsData(
        username,
        months,
        targetDb,
        targetCollection
      );

      if (!result.success) {
        return {
          success: false,
          message: "Error al obtener datos de meses",
          data: [],
          statusCode: 500,
        };
      }

      console.log(`[DataService] Datos obtenidos: ${result.data.length} meses`);

      return {
        success: true,
        message: "Datos obtenidos correctamente",
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error al obtener datos de meses:", error);
      return {
        success: false,
        message: "Error al obtener datos de meses: " + error.message,
        data: [],
        statusCode: 500,
      };
    }
  }

  /**
   * Actualiza los datos de meses específicos de un usuario
   */
  async updateMonthsData(
    username,
    monthsData,
    dbName = null,
    collectionName = null
  ) {
    try {
      // Validar entrada
      if (!Array.isArray(monthsData) || monthsData.length === 0) {
        return {
          success: false,
          message: "El array de datos es requerido y no puede estar vacío",
          conflicts: [],
          statusCode: 400,
        };
      }

      // Validar estructura de cada elemento
      for (const monthData of monthsData) {
        if (
          !monthData.username ||
          !monthData.yearMonth ||
          !monthData.updatedAt
        ) {
          return {
            success: false,
            message: "Cada elemento debe tener username, yearMonth y updatedAt",
            conflicts: [],
            statusCode: 400,
          };
        }

        // Validar que el username coincide
        if (monthData.username !== username) {
          return {
            success: false,
            message: `El username en los datos (${monthData.username}) no coincide con el de la URL (${username})`,
            conflicts: [],
            statusCode: 400,
          };
        }
      }

      // Usar valores por defecto si no se proporcionan
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(
        `[DataService] Actualizando datos de meses para usuario: ${username}`
      );
      console.log(`[DataService] Meses a actualizar: ${monthsData.length}`);

      // Actualizar datos en el modelo
      const result = await UserData.updateMonthsData(
        username,
        monthsData,
        targetDb,
        targetCollection
      );

      if (!result.success) {
        return {
          success: false,
          message: "Error al actualizar datos de meses",
          conflicts: [],
          statusCode: 500,
        };
      }

      console.log(
        `[DataService] Datos actualizados: ${result.modified} modificados, ${result.inserted} insertados`
      );
      if (result.conflicts.length > 0) {
        console.log(
          `[DataService] Conflictos detectados: ${result.conflicts.length}`
        );
      }

      return {
        success: true,
        message: "Datos actualizados correctamente",
        modified: result.modified,
        inserted: result.inserted,
        conflicts: result.conflicts,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error al actualizar datos de meses:", error);
      return {
        success: false,
        message: "Error al actualizar datos de meses: " + error.message,
        conflicts: [],
        statusCode: 500,
      };
    }
  }

  /**
   * Obtiene la lista de todos los usuarios con username y role
   */
  async getAllUsers() {
    try {
      console.log("[DataService] Obteniendo lista de usuarios con roles...");

      // Obtener todos los usuarios con username y role
      const users = await User.getAllUsersWithRoles();

      console.log(`[DataService] Usuarios encontrados: ${users.length}`);

      return {
        success: true,
        users: users,
      };
    } catch (error) {
      console.error("[DataService] Error al obtener usuarios:", error);
      throw error;
    }
  }

  async getSyncCheck(username, dbName = null, collectionName = null) {
    try {
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(
        `[DataService] Obteniendo sync-check para usuario: ${username}`
      );
      console.log(
        `[DataService] DB: ${targetDb}, Collection: ${targetCollection}`
      );

      const timestampsResult = await UserData.getTimestamps(
        username,
        targetDb,
        targetCollection
      );

      if (!timestampsResult.success) {
        return {
          success: false,
          message: "Error al obtener timestamps del usuario",
          statusCode: 500,
        };
      }

      const lockedDaysResult = await UserData.getLockedDays(
        username,
        targetDb,
        targetCollection
      );

      if (!lockedDaysResult.success) {
        return {
          success: false,
          message: "Error al obtener días bloqueados del usuario",
          statusCode: 500,
        };
      }

      console.log(
        `[DataService] Timestamps: ${
          Object.keys(timestampsResult.timestamps).length
        }`
      );
      console.log(
        `[DataService] Días bloqueados: ${lockedDaysResult.lockedDays.length}`
      );

      return {
        success: true,
        timestamps: timestampsResult.timestamps,
        lockedDays: lockedDaysResult.lockedDays,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error en getSyncCheck:", error);
      return {
        success: false,
        message:
          "Error al obtener información de sincronización: " + error.message,
        statusCode: 500,
      };
    }
  }

  /**
   * Sincronización masiva de múltiples usuarios (solo admin)
   */
  async adminBulkSync(syncRequests, dbName = null, collectionName = null) {
    try {
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(
        `[DataService] Sincronización masiva para ${syncRequests.length} usuarios`
      );
      console.log(
        `[DataService] DB: ${targetDb}, Collection: ${targetCollection}`
      );

      const serverTimestamps = {};
      const updatedData = [];

      for (const request of syncRequests) {
        const { username, localTimestamps } = request;

        console.log(`[DataService] Procesando usuario: ${username}`);

        const timestampsResult = await UserData.getTimestamps(
          username,
          targetDb,
          targetCollection
        );

        if (!timestampsResult.success) {
          console.log(
            `[DataService] Error al obtener timestamps para ${username}`
          );
          serverTimestamps[username] = {};
          continue;
        }

        serverTimestamps[username] = timestampsResult.timestamps || {};

        const monthsToFetch = [];
        for (const [yearMonth, serverTimestamp] of Object.entries(
          serverTimestamps[username]
        )) {
          const localTimestamp = localTimestamps[yearMonth];

          if (!localTimestamp) {
            monthsToFetch.push(yearMonth);
            console.log(
              `[DataService] ${username} - ${yearMonth}: No existe en cliente, se descargará`
            );
          } else {
            const serverDate = new Date(serverTimestamp);
            const localDate = new Date(localTimestamp);

            if (serverDate > localDate) {
              monthsToFetch.push(yearMonth);
              console.log(
                `[DataService] ${username} - ${yearMonth}: Servidor más reciente (${serverTimestamp} > ${localTimestamp})`
              );
            }
          }
        }

        if (monthsToFetch.length > 0) {
          console.log(
            `[DataService] Obteniendo ${monthsToFetch.length} meses para ${username}`
          );
          const monthsDataResult = await UserData.getMonthsData(
            username,
            monthsToFetch,
            targetDb,
            targetCollection
          );

          if (monthsDataResult.success && monthsDataResult.data) {
            updatedData.push(...monthsDataResult.data);
          }
        } else {
          console.log(
            `[DataService] ${username} está sincronizado, no hay datos nuevos`
          );
        }
      }

      console.log(`[DataService] Sincronización masiva completada`);
      console.log(
        `[DataService] Total meses a actualizar: ${updatedData.length}`
      );

      return {
        success: true,
        serverTimestamps,
        updatedData,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error en sincronización masiva:", error);
      return {
        success: false,
        message: "Error en sincronización masiva: " + error.message,
        serverTimestamps: {},
        updatedData: [],
        statusCode: 500,
      };
    }
  }

  async syncCheck(
    username,
    localTimestamps,
    dbName = null,
    collectionName = null
  ) {
    try {
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(`[DataService] Sync check para usuario: ${username}`);
      console.log(
        `[DataService] Días locales: ${Object.keys(localTimestamps).length}`
      );

      const serverResult = await UserData.getDayTimestamps(
        username,
        targetDb,
        targetCollection
      );

      if (!serverResult.success) {
        return {
          success: false,
          message: "Error al obtener timestamps del servidor",
          statusCode: 500,
        };
      }

      const serverTimestamps = serverResult.dayTimestamps;
      const daysToUpload = [];
      const daysToDownload = [];
      const lockedConflicts = [];

      for (const [localDay, localTs] of Object.entries(localTimestamps)) {
        const serverInfo = serverTimestamps[localDay];

        if (!serverInfo) {
          daysToUpload.push(localDay);
        } else if (serverInfo.isLocked) {
          lockedConflicts.push(localDay);
        } else if (localTs > serverInfo.ts) {
          daysToUpload.push(localDay);
        } else if (serverInfo.ts > localTs) {
          daysToDownload.push(localDay);
        }
      }

      for (const [serverDay, serverInfo] of Object.entries(serverTimestamps)) {
        if (!localTimestamps[serverDay]) {
          daysToDownload.push(serverDay);
        }
      }

      console.log(
        `[DataService] Para subir: ${daysToUpload.length}, para descargar: ${daysToDownload.length}, conflictos: ${lockedConflicts.length}`
      );

      return {
        success: true,
        daysToUpload,
        daysToDownload,
        lockedConflicts,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error al realizar sync check:", error);
      return {
        success: false,
        message: "Error al realizar sync check: " + error.message,
        statusCode: 500,
      };
    }
  }

  async syncUpload(username, daysData, dbName = null, collectionName = null) {
    try {
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(`[DataService] Sync upload para usuario: ${username}`);
      console.log(`[DataService] Días a subir: ${daysData.length}`);

      if (!Array.isArray(daysData) || daysData.length === 0) {
        return {
          success: false,
          message: "El array de días es requerido y no puede estar vacío",
          statusCode: 400,
        };
      }

      const result = await UserData.uploadDays(
        username,
        daysData,
        targetDb,
        targetCollection
      );

      if (!result.success) {
        return {
          success: false,
          message: "Error al subir datos",
          statusCode: 500,
        };
      }

      console.log(
        `[DataService] Subida completada: ${result.uploaded} días subidos, ${result.skipped} omitidos`
      );

      return {
        success: true,
        message: "Datos subidos correctamente",
        uploaded: result.uploaded,
        skipped: result.skipped,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error en syncUpload:", error);
      return {
        success: false,
        message: "Error al subir datos: " + error.message,
        statusCode: 500,
      };
    }
  }

  async syncDownload(username, dates, dbName = null, collectionName = null) {
    try {
      const targetDb = dbName || process.env.MONGO_DB_NAME || "timeTrackingDB";
      const targetCollection =
        collectionName || process.env.MONGO_COLLECTION_NAME || "monthlyData";

      console.log(`[DataService] Sync download para usuario: ${username}`);
      console.log(`[DataService] Fechas solicitadas: ${dates.length}`);

      if (!Array.isArray(dates) || dates.length === 0) {
        return {
          success: false,
          message: "El array de fechas es requerido y no puede estar vacío",
          statusCode: 400,
        };
      }

      const result = await UserData.downloadDays(
        username,
        dates,
        targetDb,
        targetCollection
      );

      if (!result.success) {
        return {
          success: false,
          message: "Error al descargar datos",
          statusCode: 500,
        };
      }

      console.log(
        `[DataService] Descarga completada: ${result.data.length} días descargados`
      );

      return {
        success: true,
        data: result.data,
        statusCode: 200,
      };
    } catch (error) {
      console.error("[DataService] Error en syncDownload:", error);
      return {
        success: false,
        message: "Error al descargar datos: " + error.message,
        statusCode: 500,
      };
    }
  }
}

module.exports = new DataService();
