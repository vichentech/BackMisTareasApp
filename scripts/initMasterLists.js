/**
 * Script para inicializar las listas maestras
 * Ejecutar con: node scripts/initMasterLists.js
 */

require('dotenv').config();
const configService = require('../services/configService');

async function initMasterLists() {
  try {
    console.log('🔧 Inicializando listas maestras...\n');
    
    const result = await configService.initializeMasterLists();

    if (!result.success) {
      console.error('❌ Error:', result.message);
      process.exit(1);
    }

    console.log('✓', result.message);
    
    // Verificar que result.data existe
    if (!result.data) {
      console.error('❌ Error: No se recibieron datos de las listas maestras');
      process.exit(1);
    }

    console.log('\n📋 Listas maestras:\n');
    console.log('═'.repeat(60));
    
    // Mostrar proyectos
    if (result.data.projects && Array.isArray(result.data.projects) && result.data.projects.length > 0) {
      console.log('\n🗂️  PROYECTOS (' + result.data.projects.length + '):');
      console.log('─'.repeat(60));
      result.data.projects.forEach((project, index) => {
        console.log(`  ${(index + 1).toString().padStart(2, '0')}. [${project.pnr}] ${project.pnm}`);
        console.log(`      ID: ${project.id}`);
      });
    } else {
      console.log('\n🗂️  PROYECTOS: No hay proyectos disponibles');
    }
    
    // Mostrar tareas
    if (result.data.mainTasks && Array.isArray(result.data.mainTasks) && result.data.mainTasks.length > 0) {
      console.log('\n📝 TAREAS PRINCIPALES (' + result.data.mainTasks.length + '):');
      console.log('─'.repeat(60));
      result.data.mainTasks.forEach((task, index) => {
        console.log(`  ${(index + 1).toString().padStart(2, '0')}. ${task.name}`);
        console.log(`      ID: ${task.id}`);
      });
    } else {
      console.log('\n📝 TAREAS PRINCIPALES: No hay tareas disponibles');
    }
    
    // Mostrar vehículos
    if (result.data.vehicles && Array.isArray(result.data.vehicles) && result.data.vehicles.length > 0) {
      console.log('\n🚗 VEHÍCULOS (' + result.data.vehicles.length + '):');
      console.log('─'.repeat(60));
      result.data.vehicles.forEach((vehicle, index) => {
        console.log(`  ${(index + 1).toString().padStart(2, '0')}. ${vehicle.name}`);
        console.log(`      ID: ${vehicle.id}`);
      });
    } else {
      console.log('\n🚗 VEHÍCULOS: No hay vehículos disponibles');
    }
    
    // Mostrar fecha de actualización
    console.log('\n' + '═'.repeat(60));
    if (result.data.updatedAt) {
      const date = new Date(result.data.updatedAt);
      console.log(`⏰ Última actualización: ${date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })}`);
    }
    console.log('═'.repeat(60) + '\n');

    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al inicializar listas maestras:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar
initMasterLists();