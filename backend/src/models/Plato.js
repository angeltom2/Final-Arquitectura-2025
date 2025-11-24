const { DataTypes } = require("sequelize");
const { sequelize } = require("../lib/sequelize");

const Plato = sequelize.define("Plato", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio_venta: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    jefe_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "platos",
    timestamps: true
});

module.exports = Plato;
