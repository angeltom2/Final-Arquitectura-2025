// backend/src/models/associations.js
const Plato = require("./Plato");
const PlatoIngrediente = require("./PlatoIngrediente");
const Producto = require("./product.model");

// Relación Plato <-> PlatoIngrediente
Plato.hasMany(PlatoIngrediente, { foreignKey: "plato_id", as: "ingredientesPlato" });
PlatoIngrediente.belongsTo(Plato, { foreignKey: "plato_id", as: "platoRelacionado" });

// Relación Producto <-> PlatoIngrediente
Producto.hasMany(PlatoIngrediente, { foreignKey: "producto_id", as: "ingredientesProducto" });
PlatoIngrediente.belongsTo(Producto, { foreignKey: "producto_id", as: "productoRelacionado" });

module.exports = { Plato, PlatoIngrediente, Producto };
