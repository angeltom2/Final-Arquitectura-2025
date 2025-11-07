require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./lib/sequelize');
const { createAdminUser } = require('./seeders/createAdmin'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importar modelos
require('./models/usuario.model');
require('./models/product.model');

// Rutas
const routes = require('./routes'); // Esto cargará ./routes/index.js
app.use('/api', routes);

const PORT = process.env.BACKEND_PORT || 4000;

async function start() {
  try {
    console.log('🟡 Iniciando servidor...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados.');

    await createAdminUser();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el backend:', error);
    process.exit(1);
  }
}

start();
