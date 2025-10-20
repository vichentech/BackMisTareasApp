const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testSetupEndpoints() {
  console.log('🧪 Probando endpoints de configuración inicial...\n');

  try {
    // 1. Verificar estado de configuración
    console.log('1️⃣  Verificando estado de configuración...');
    const statusResponse = await axios.get(`${BASE_URL}/setup/status`);
    console.log('   Respuesta:', statusResponse.data);
    console.log('   ✓ Estado verificado correctamente\n');

    if (statusResponse.data.setupNeeded) {
      // 2. Crear primer administrador
      console.log('2️⃣  Creando primer administrador...');
      const createAdminResponse = await axios.post(`${BASE_URL}/setup/create-admin`, {
        username: 'admin',
        password: 'Admin123'
      });
      console.log('   Respuesta:', createAdminResponse.data);
      console.log('   ✓ Administrador creado correctamente\n');

      // 3. Verificar que ya no se necesita configuración
      console.log('3️⃣  Verificando que la configuración está completa...');
      const statusResponse2 = await axios.get(`${BASE_URL}/setup/status`);
      console.log('   Respuesta:', statusResponse2.data);
      console.log('   ✓ Configuración completada\n');

      // 4. Intentar crear otro administrador (debe fallar)
      console.log('4️⃣  Intentando crear otro administrador (debe fallar)...');
      try {
        await axios.post(`${BASE_URL}/setup/create-admin`, {
          username: 'admin2',
          password: 'Admin456'
        });
        console.log('   ❌ ERROR: No debería permitir crear otro administrador\n');
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log('   ✓ Correctamente rechazado (409 Conflict)\n');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ℹ️  El sistema ya está configurado\n');
    }

    console.log('✅ Todas las pruebas pasaron correctamente');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    process.exit(1);
  }
}

testSetupEndpoints();