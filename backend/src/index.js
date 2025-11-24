// backend/src/index.js
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
require('./models/movimientoInventario.model');
require('./models/solicitud.model');
require('./models/cotizacion.model');
require('./models/valorCotizacion.model');
require('./models/ordenCompra.model');
require('./models/Plato');
require('./models/PlatoIngrediente');
require("./models/associations");

// Rutas principales
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/solicitudes', require('./routes/solicitud.routes'));
app.use('/api/cotizaciones', require('./routes/cotizacion.routes'));
app.use('/api/director', require('./routes/director.routes'));
app.use('/api/platos', require('./routes/platos'));

// Rutas adicionales (ej: health)
app.use('/api', require('./routes'));

const PORT = process.env.BACKEND_PORT || 4000;

// Iniciar servidor
async function start() {
  try {
    console.log('🟡 Iniciando backend...');

    // Conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la DB establecida.');

    // ⚠️ No alterar tablas existentes para evitar errores de FK
    await sequelize.sync({ alter: false });
    console.log('🔄 Modelos sincronizados sin alterar tablas existentes.');

    // Crear admin si no existe
    await createAdminUser();
    console.log('👑 Admin verificado.');

    // Arrancar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar backend:', error);
    process.exit(1);
  }
}

start();
