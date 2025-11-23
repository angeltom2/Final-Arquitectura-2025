// backend/src/seeders/createAdmin.js
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');

async function createAdminUser() {
  try {
    const exists = await Usuario.findOne({ where: { email: "admin@konrad.com" } });
    if (exists) {
      console.log("⚙️  Admin ya existente, no se crea uno nuevo.");
      return;
    }

    const hashed = await bcrypt.hash("Admin123*", 10);

    await Usuario.create({
      nombre: "Administrador",
      email: "admin@konrad.com",
      password_hash: hashed,
      rol: "admin",
      activo: true,
    });

    console.log("✅ Admin creado: admin@konrad.com / Admin123*");

  } catch (error) {
    console.error("❌ Error creando admin:", error);
  }
}

module.exports = { createAdminUser };
