/**
 * Script para crear el primer usuario administrador
 * Ejecutar con: node scripts/createAdminUser.js
 */

require('dotenv').config();
const authService = require('../services/authService');

async function createAdminUser() {
  try {
    console.log('🔧 Inicializando base de datos de autenticación...');
    
    // Inicializar índices
    await authService.initializeDatabase();
    console.log('✓ Base de datos inicializada');

    // Crear usuario administrador
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin';

    console.log(`\n👤 Creando usuario administrador: ${username}`);
    
    const result = await authService.createUser(username, password, 'admin');

    if (result.success) {
      console.log('✓ Usuario administrador creado exitosamente');
      console.log(`\n📋 Credenciales:`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: admin`);
      console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login\n');
    } else {
      console.error('❌ Error:', result.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    process.exit(1);
  }
}

createAdminUser();