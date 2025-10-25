require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function testAdminCreateUser() {
  console.log('🧪 Probando endpoint POST /admin/users\n');

  try {
    // Paso 0: Verificar si necesitamos crear admin
    console.log('0️⃣ Verificando estado del setup...');
    const setupResponse = await fetch(`${BASE_URL}/setup/status`);
    const setupData = await setupResponse.json();
    
    if (setupData.setupNeeded) {
      console.log('⚠️  Se necesita crear admin. Creando...');
      const createAdminResponse = await fetch(`${BASE_URL}/setup/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin'
        })
      });
      
      const createAdminData = await createAdminResponse.json();
      if (!createAdminData.success) {
        console.error('❌ Error al crear admin:', createAdminData.message);
        return;
      }
      console.log('✅ Admin creado exitosamente');
    } else {
      console.log('✅ Admin ya existe');
    }

    // Paso 1: Login como admin
    console.log('\n1️⃣ Haciendo login como admin...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      console.log('💡 Intenta con las credenciales correctas del admin existente');
      return;
    }

    console.log('✅ Login exitoso');
    const adminToken = loginData.accessToken;

    // Paso 2: Crear nuevo usuario
    console.log('\n2️⃣ Creando nuevo usuario...');
    const createUserResponse = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: 'testuser_' + Date.now(),
        password: 'test123',
        role: 'user'
      })
    });

    const createUserData = await createUserResponse.json();
    
    console.log('\n📋 Respuesta del servidor:');
    console.log('Status:', createUserResponse.status);
    console.log('Body:', JSON.stringify(createUserData, null, 2));

    if (createUserData.success) {
      console.log('\n✅ Usuario creado exitosamente!');
      console.log('Username:', createUserData.user.username);
      console.log('Role:', createUserData.user.role);
    } else {
      console.log('\n❌ Error al crear usuario:', createUserData.message);
    }

    // Paso 3: Intentar crear usuario sin token (debe fallar)
    console.log('\n3️⃣ Probando sin token (debe fallar)...');
    const noTokenResponse = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser2',
        password: 'test123',
        role: 'user'
      })
    });

    const noTokenData = await noTokenResponse.json();
    console.log('Status:', noTokenResponse.status);
    console.log('Body:', JSON.stringify(noTokenData, null, 2));

    if (noTokenResponse.status === 401) {
      console.log('✅ Correctamente rechazado sin token');
    } else {
      console.log('❌ Debería haber sido rechazado');
    }

    // Paso 4: Intentar crear usuario con token de usuario normal (debe fallar)
    console.log('\n4️⃣ Probando con usuario normal (debe fallar)...');
    
    // Primero crear un usuario normal
    const normalUserResponse = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        username: 'normaluser_' + Date.now(),
        password: 'test123',
        role: 'user'
      })
    });

    const normalUserData = await normalUserResponse.json();
    
    if (normalUserData.success) {
      // Hacer login con el usuario normal
      const normalLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: normalUserData.user.username,
          password: 'test123'
        })
      });

      const normalLoginData = await normalLoginResponse.json();
      
      if (normalLoginData.success) {
        // Intentar crear usuario con token de usuario normal
        const normalUserCreateResponse = await fetch(`${BASE_URL}/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${normalLoginData.accessToken}`
          },
          body: JSON.stringify({
            username: 'testuser3',
            password: 'test123',
            role: 'user'
          })
        });

        const normalUserCreateData = await normalUserCreateResponse.json();
        console.log('Status:', normalUserCreateResponse.status);
        console.log('Body:', JSON.stringify(normalUserCreateData, null, 2));

        if (normalUserCreateResponse.status === 403) {
          console.log('✅ Correctamente rechazado (usuario sin permisos de admin)');
        } else {
          console.log('❌ Debería haber sido rechazado');
        }
      }
    }

    console.log('\n✅ Todas las pruebas completadas!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testAdminCreateUser();
