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
require('./models/solicitud.model');   // 👈 Solicitudes
require('./models/cotizacion.model');  // 👈 Cotizaciones
require('./models/valorCotizacion.model'); // nuevo
require('./models/ordenCompra.model');     // nuevo
require('./models/Plato');
require('./models/PlatoIngrediente');

// Rutas principales
app.use('/api/auth', require('./routes/auth.routes'));           // Login / Registro
app.use('/api/usuarios', require('./routes/usuario.routes'));    // CRUD usuarios
app.use('/api/inventario', require('./routes/inventario.routes')); // Inventario
app.use('/api/solicitudes', require('./routes/solicitud.routes')); // Solicitudes
app.use('/api/cotizaciones', require('./routes/cotizacion.routes')); // Cotizaciones
app.use('/api/director', require('./routes/director.routes')); // <-- agregar
app.use('/api/platos', require('./routes/platos'));

// Rutas adicionales (ej: health)
app.use('/api', require('./routes'));

const PORT = process.env.BACKEND_PORT || 4000;

// Iniciar servidor
async function start() {
  try {
    console.log('🟡 Iniciando backend...');

    await sequelize.authenticate();
    console.log('✅ Conexión a la DB establecida.');

    await sequelize.sync({ alter: true });
    console.log('🔄 Modelos sincronizados.');

    await createAdminUser();
    console.log('👑 Admin verificado.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar backend:', error);
    process.exit(1);
  }
}

start();
