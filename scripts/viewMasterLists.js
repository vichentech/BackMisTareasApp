/**
 * Script para ver las listas maestras actuales
 * Ejecutar con: node scripts/viewMasterLists.js
 */

require('dotenv').config();
const configService = require('../services/configService');

async function viewMasterLists() {
  try {
    console.log('🔍 Consultando listas maestras...\n');
    
    const result = await configService.getMasterLists();

    if (!result.success) {
      console.error('❌ Error:', result.message || 'No se pudieron obtener las listas');
      process.exit(1);
    }

    console.log('✓ Listas maestras obtenidas correctamente\n');
    console.log('═'.repeat(60));
    
    // Mostrar proyectos
    if (result.projects && Array.isArray(result.projects) && result.projects.length > 0) {
      console.log('\n🗂️  PROYECTOS (' + result.projects.length + '):');
      console.log('─'.repeat(60));
      result.projects.forEach((project, index) => {
        console.log(`  ${(index + 1).toString().padStart(2, '0')}. [${project.pnr}] ${project.pnm}`);
        console.log(`      ID: ${project.id}`);
      });
    } else {
      console.log('\n🗂️  PROYECTOS: No hay proyectos disponibles');
    }
    
    // Mostrar tareas
    if (result.mainTasks && Array.isArray(result.mainTasks) && result.mainTasks.length > 0) {
      console.log('\n📝 TAREAS PRINCIPALES (' + result.mainTasks.length + '):');
      console.log('─'.repeat(60));
      result.mainTasks.forEach((task, index) => {
        console.log(`  ${(index + 1).toString().padStart(2, '0')}. ${task.name}`);
        console.log(`      ID: ${task.id}`);
      });
    } else {
      console.log('\n📝 TAREAS PRINCIPALES: No hay tareas disponibles');
    }
    
    // Mostrar vehículos
    if (result.vehicles && Array.isArray(result.vehicles) && result.vehicles.length > 0) {
      console.log('\n🚗 VEHÍCULOS (' + result.vehicles.length + '):');
      console.log('─'.repeat(60));
      result.vehicles.forEach((vehicle, index) => {
        console.log(`  ${(index + 1).toString().padStart(2, '0')}. ${vehicle.name}`);
        console.log(`      ID: ${vehicle.id}`);
      });
    } else {
      console.log('\n🚗 VEHÍCULOS: No hay vehículos disponibles');
    }
    
    // Mostrar fecha de actualización
    console.log('\n' + '═'.repeat(60));
    if (result.updatedAt) {
      const date = new Date(result.updatedAt);
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

    console.log('✅ Consulta completada exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al consultar listas maestras:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar
viewMasterLists();