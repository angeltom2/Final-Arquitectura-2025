// backend/src/models/product.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unidad: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Kg',
  },
  stock_actual: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  stock_minimo: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 10,
  },
  precio_promedio: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'productos',
  timestamps: true,
});

module.exports = Producto;
