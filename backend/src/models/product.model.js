const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  categoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cantidad: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  unidad: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  precio_sugerido: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true,
  },
}, {
  tableName: 'productos',
  timestamps: true
});

module.exports = Producto;
