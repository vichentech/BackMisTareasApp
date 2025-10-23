const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

let adminToken = '';
let userToken = '';

async function testListsEndpoints() {
  console.log('='.repeat(60));
  console.log('PRUEBA DE ENDPOINTS DE LISTAS PERSONALES');
  console.log('='.repeat(60));

  try {
    console.log('\n1. Login como admin...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login-admin`, {
      username: 'admin',
      password: 'admin123'
    });
    adminToken = adminLogin.data.token;
    console.log('✓ Login admin exitoso');

    console.log('\n2. Login como usuario normal...');
    const userLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'test123'
    });
    userToken = userLogin.data.token;
    console.log('✓ Login usuario exitoso');

    console.log('\n3. Obtener listas de usuario (primera vez - debe devolver estructura vacía)...');
    const getLists1 = await axios.get(`${BASE_URL}/data/lists/testuser`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✓ Listas obtenidas:');
    console.log(JSON.stringify(getLists1.data, null, 2));

    console.log('\n4. Actualizar listas del usuario...');
    const updateLists = await axios.post(`${BASE_URL}/data/lists/testuser`, {
      updatedAt: new Date().toISOString(),
      projects: [
        { id: 'proj-1', pnr: 'PRJ-001', pnm: 'Proyecto Test 1' },
        { id: 'proj-2', pnr: 'PRJ-002', pnm: 'Proyecto Test 2' }
      ],
      mainTasks: [
        { id: 'task-1', name: 'Mantenimiento Preventivo' },
        { id: 'task-2', name: 'Reparación' }
      ],
      vehicles: [
        { id: 'veh-1', name: '1234-ABC' }
      ]
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✓ Listas actualizadas:');
    console.log(JSON.stringify(updateLists.data, null, 2));

    console.log('\n5. Obtener listas actualizadas...');
    const getLists2 = await axios.get(`${BASE_URL}/data/lists/testuser`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('✓ Listas obtenidas:');
    console.log(JSON.stringify(getLists2.data, null, 2));

    console.log('\n6. Admin obtiene listas de otro usuario...');
    const adminGetLists = await axios.get(`${BASE_URL}/data/lists/testuser`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✓ Admin puede ver listas de testuser:');
    console.log(`  - Projects: ${adminGetLists.data.projects.length}`);
    console.log(`  - MainTasks: ${adminGetLists.data.mainTasks.length}`);
    console.log(`  - Vehicles: ${adminGetLists.data.vehicles.length}`);

    console.log('\n7. Intentar acceder a listas de otro usuario sin permisos (debe fallar)...');
    try {
      await axios.get(`${BASE_URL}/data/lists/admin`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✗ ERROR: No debería permitir el acceso');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✓ Acceso denegado correctamente (403)');
      } else {
        console.log('✗ Error inesperado:', error.message);
      }
    }

    console.log('\n8. Intentar actualizar listas sin autenticación (debe fallar)...');
    try {
      await axios.post(`${BASE_URL}/data/lists/testuser`, {
        projects: [],
        mainTasks: [],
        vehicles: []
      });
      console.log('✗ ERROR: No debería permitir actualizar sin token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Acceso denegado correctamente (401)');
      } else {
        console.log('✗ Error inesperado:', error.message);
      }
    }

    console.log('\n9. Intentar actualizar con datos inválidos (debe fallar)...');
    try {
      await axios.post(`${BASE_URL}/data/lists/testuser`, {
        projects: 'invalid',
        mainTasks: [],
        vehicles: []
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('✗ ERROR: No debería permitir datos inválidos');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Validación correcta (400)');
        console.log(`  Mensaje: ${error.response.data.message}`);
      } else {
        console.log('✗ Error inesperado:', error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ ERROR EN LAS PRUEBAS:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Mensaje: ${error.response.data.message || error.response.statusText}`);
      console.error(`  Data:`, error.response.data);
    } else {
      console.error(`  ${error.message}`);
    }
    process.exit(1);
  }
}

testListsEndpoints();
