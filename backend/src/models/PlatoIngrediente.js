const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/sequelize");
const Plato = require("./Plato");

const PlatoIngrediente = sequelize.define("PlatoIngrediente", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    plato_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    producto_id: {
        type: DataTypes.INTEGER,
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

Plato.hasMany(PlatoIngrediente, { foreignKey: "plato_id" });
PlatoIngrediente.belongsTo(Plato, { foreignKey: "plato_id" });

module.exports = PlatoIngrediente;
