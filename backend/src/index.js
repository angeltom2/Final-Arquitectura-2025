require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./lib/sequelize');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.BACKEND_PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: conexión establecida.');
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Backend escuchando en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error iniciando backend:', err);
    process.exit(1);
  }
}

start();
