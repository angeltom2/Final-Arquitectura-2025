// backend/src/models/movimientoInventario.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');
const Producto = require('./product.model');

const MovimientoInventario = sequelize.define('MovimientoInventario', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'salida'),
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  productoId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
}, {
  tableName: 'movimientos_inventario',
  timestamps: true,
});

// 🔗 Asociaciones
MovimientoInventario.belongsTo(Producto, {
  foreignKey: 'productoId',
  onDelete: 'CASCADE',
});
Producto.hasMany(MovimientoInventario, {
  foreignKey: 'productoId',
});

module.exports = MovimientoInventario;
