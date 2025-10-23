const UserList = require('../models/UserList');
const User = require('../models/User');

class ListsController {
  async getUserLists(req, res, next) {
    try {
      const { username } = req.params;
      const requestingUser = req.user;

      console.log(`\n[GET_LISTS] Usuario solicitante: ${requestingUser.username} (${requestingUser.role})`);
      console.log(`[GET_LISTS] Listas solicitadas de: ${username}`);

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro username es requerido'
        });
      }

      if (requestingUser.role !== 'admin' && requestingUser.username !== username) {
        console.log(`[GET_LISTS] Acceso denegado: usuario ${requestingUser.username} intentó acceder a listas de ${username}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a las listas de este usuario'
        });
      }

      const userExists = await User.findByUsername(username);
      if (!userExists) {
        console.log(`[GET_LISTS] Usuario ${username} no existe`);
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const userLists = await UserList.findByUsername(username);

      console.log(`[GET_LISTS] Listas obtenidas exitosamente`);
      console.log(`[GET_LISTS] updatedAt: ${userLists.updatedAt}`);
      console.log(`[GET_LISTS] projects: ${userLists.projects.length}, mainTasks: ${userLists.mainTasks.length}, vehicles: ${userLists.vehicles.length}\n`);

      const response = {
        updatedAt: userLists.updatedAt.toISOString(),
        projects: userLists.projects,
        mainTasks: userLists.mainTasks,
        vehicles: userLists.vehicles
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('[GET_LISTS] Error:', error);
      next(error);
    }
  }

  async updateUserLists(req, res, next) {
    try {
      const { username } = req.params;
      const requestingUser = req.user;
      const listsData = req.body;

      console.log(`\n[UPDATE_LISTS] Usuario solicitante: ${requestingUser.username} (${requestingUser.role})`);
      console.log(`[UPDATE_LISTS] Actualizando listas de: ${username}`);

      if (!username) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro username es requerido'
        });
      }

      if (requestingUser.role !== 'admin' && requestingUser.username !== username) {
        console.log(`[UPDATE_LISTS] Acceso denegado: usuario ${requestingUser.username} intentó actualizar listas de ${username}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para actualizar las listas de este usuario'
        });
      }

      if (!listsData || typeof listsData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'El cuerpo de la petición debe ser un objeto JSON válido'
        });
      }

      if (!Array.isArray(listsData.projects) || !Array.isArray(listsData.mainTasks) || !Array.isArray(listsData.vehicles)) {
        return res.status(400).json({
          success: false,
          message: 'Los campos projects, mainTasks y vehicles deben ser arrays'
        });
      }

      const userExists = await User.findByUsername(username);
      if (!userExists) {
        console.log(`[UPDATE_LISTS] Usuario ${username} no existe`);
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const result = await UserList.upsert(username, listsData);

      console.log(`[UPDATE_LISTS] Listas actualizadas exitosamente`);
      console.log(`[UPDATE_LISTS] Nueva updatedAt: ${result.updatedAt}`);
      console.log(`[UPDATE_LISTS] projects: ${listsData.projects.length}, mainTasks: ${listsData.mainTasks.length}, vehicles: ${listsData.vehicles.length}\n`);

      return res.status(200).json({
        success: true,
        updatedAt: result.updatedAt
      });
    } catch (error) {
      console.error('[UPDATE_LISTS] Error:', error);
      next(error);
    }
  }
}

module.exports = new ListsController();
