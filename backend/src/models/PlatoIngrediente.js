const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/sequelize");
const Producto = require("./product.model");
const Plato = require("./Plato");

const PlatoIngrediente = sequelize.define("PlatoIngrediente", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    plato_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    producto_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    unidad: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: "platos_ingredientes",
    timestamps: true
});

// Relaciones
Plato.hasMany(PlatoIngrediente, { foreignKey: "plato_id", as: "ingredientes", constraints: false });
PlatoIngrediente.belongsTo(Plato, { foreignKey: "plato_id", as: "plato", constraints: false });

PlatoIngrediente.belongsTo(Producto, { foreignKey: "producto_id", as: "producto", constraints: false });

module.exports = PlatoIngrediente;
