// backend/src/models/valorCotizacion.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');

const ValorCotizacion = sequelize.define('ValorCotizacion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cotizacionId: { type: DataTypes.INTEGER, allowNull: false },
  valores: { type: DataTypes.JSON, allowNull: false }, // [{ productoId, nombre, precioUnitario }]
  registradoPor: { type: DataTypes.INTEGER, allowNull: false }, // id del director que registra
  fechaRegistro: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
});

module.exports = ValorCotizacion;
