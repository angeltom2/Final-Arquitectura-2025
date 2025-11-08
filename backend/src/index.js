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

// ✅ Rutas generales (auth, productos, etc.)
const routes = require('./routes');
app.use('/api', routes);

// ✅ Rutas específicas para usuarios (CRUD admin)
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);

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

    // 3️⃣ Crear admin si no existe
    await createAdminUser();

    // 4️⃣ Levantar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el backend:', error);
    process.exit(1);
  }
}

start();
