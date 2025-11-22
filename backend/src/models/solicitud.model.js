// backend/src/models/solicitud.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');

const Solicitud = sequelize.define('Solicitud', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  solicitanteNombre: { type: DataTypes.STRING, allowNull: false }, // nombre del Jefe de Cocina
  solicitanteId: { type: DataTypes.INTEGER, allowNull: false }, // id usuario
  productos: { type: DataTypes.JSON, allowNull: false }, // [{ productoId, nombre, cantidad, unidad }]
  fechaSolicitud: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  estado: {
    type: DataTypes.ENUM('pendiente','aprobada','rechazada','completada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  observaciones: { type: DataTypes.STRING, allowNull: true },
  proveedorSeleccionado: { type: DataTypes.STRING, allowNull: true }, // opcional
});

module.exports = Solicitud;
