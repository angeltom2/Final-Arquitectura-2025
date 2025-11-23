// backend/src/models/cotizacion.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');

const Cotizacion = sequelize.define('Cotizacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  solicitudId: { type: DataTypes.INTEGER, allowNull: false },
  proveedor: { type: DataTypes.STRING, allowNull: false },
  fecha_limite: { type: DataTypes.DATE, allowNull: false },
  productos: { type: DataTypes.JSON, allowNull: false }, // [{ productoId, nombre, cantidad, unidad }]
  estado: {
    type: DataTypes.ENUM('pendiente', 'enviada', 'opcionada', 'rechazada', 'sospechosa'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  notas: { type: DataTypes.STRING, allowNull: true },
  fechaCreacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = Cotizacion;
