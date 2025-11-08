// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./lib/sequelize');
const { createAdminUser } = require('./seeders/createAdmin');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Importar modelos
require('./models/usuario.model');
require('./models/product.model');
require('./models/movimientoInventario.model');

// ✅ Rutas
app.use('/api/auth', require('./routes/auth.routes'));        // Login / Register
app.use('/api/usuarios', require('./routes/usuario.routes')); // CRUD de usuarios
app.use('/api/inventario', require('./routes/inventario.routes')); // Inventario y movimientos

// ⚙️ Rutas adicionales si las usas (por ejemplo productos, health, etc.)
app.use('/api', require('./routes')); // Esto puede quedar al final si "routes/index.js" tiene otras rutas

const PORT = process.env.BACKEND_PORT || 4000;

// 🚀 Función principal
async function start() {
  try {
    console.log('🟡 Iniciando servidor...');

    // 1️⃣ Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // 2️⃣ Sincronizar modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados.');

    // 3️⃣ Crear usuario admin si no existe
    await createAdminUser();

    // 4️⃣ Levantar el servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el backend:', error);
    process.exit(1);
  }
}

start();
