// backend/src/models/ordenCompra.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');

const OrdenCompra = sequelize.define('OrdenCompra', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacionId: { type: DataTypes.INTEGER, allowNull: false },
  proveedor: { type: DataTypes.STRING, allowNull: false },
  productos: { type: DataTypes.JSON, allowNull: false }, // [{ productoId, nombre, cantidad, unidad, precioUnitario, subTotal }]
  total: { type: DataTypes.FLOAT, allowNull: false },
  creadoPor: { type: DataTypes.INTEGER, allowNull: false }, // id del director
  fechaCreacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  estado: { type: DataTypes.ENUM('creada','enviada','recibida'), allowNull: false, defaultValue: 'creada' }
});

module.exports = OrdenCompra;
