// backend/src/models/pedido.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/sequelize");
const Plato = require("./Plato"); // asegúrate de la ruta

// Modelo Pedido
const Pedido = sequelize.define("Pedido", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  mesa: { type: DataTypes.STRING, allowNull: false },
  estado: { type: DataTypes.STRING, defaultValue: "pendiente" },
  total: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: "pedidos", timestamps: true });

// Modelo DetallePedido
const DetallePedido = sequelize.define("DetallePedido", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pedidoId: { type: DataTypes.INTEGER, allowNull: false },
  platoId: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false },
  precio_unitario: { type: DataTypes.FLOAT, allowNull: false },
}, { tableName: "detalle_pedidos", timestamps: true });

// Relaciones
Pedido.hasMany(DetallePedido, { foreignKey: "pedidoId", as: "detalle" });
DetallePedido.belongsTo(Pedido, { foreignKey: "pedidoId" });

// ✅ Relación DetallePedido → Plato
DetallePedido.belongsTo(Plato, { foreignKey: "platoId", as: "plato" });
Plato.hasMany(DetallePedido, { foreignKey: "platoId" });

module.exports = { Pedido, DetallePedido };
