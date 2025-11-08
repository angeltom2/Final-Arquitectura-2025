require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./lib/sequelize');
const { createAdminUser } = require('./seeders/createAdmin');

const app = express();
-
app.use(cors());
app.use(express.json());


require('./models/usuario.model');
require('./models/product.model');

const routes = require('./routes'); // Rutas generales (auth, productos, etc.)
app.use('/api', routes);

// ✅ Agregar ruta específica para usuarios
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.BACKEND_PORT || 4000;

async function start() {
  try {
    console.log('🟡 Iniciando servidor...');

    // 1️⃣ Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // 2️⃣ Sincronizar los modelos
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados.');

    // 3️⃣ Crear usuario admin (si no existe)
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
