// backend/src/seeders/createAdmin.js
const Usuario = require('../models/usuario.model');

async function createAdminUser() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await Usuario.findOne({ where: { rol: 'admin' } });
    if (existingAdmin) {
      console.log('⚙️  Admin ya existente, no se crea uno nuevo.');
      return;
    }

    // Crear admin sin hashear manualmente; el hook beforeCreate se encargará
    await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@konrad.com',
      password_hash: 'Admin123*', // texto plano → hook lo convierte en hash
      rol: 'admin',
      activo: true,
    });

    console.log('✅ Usuario admin creado exitosamente: admin@konrad.com / Admin123*');
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  }
}

module.exports = { createAdminUser };
