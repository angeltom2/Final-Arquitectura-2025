// backend/src/models/usuario.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../lib/sequelize');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM(
      'admin',
      'jefe_cocina',
      'mesero',
      'aux_compras',
      'dir_compras',
      'dir_comercial',
      'cocinero'   // <-- nuevo rol agregado
    ),
    allowNull: false,
    defaultValue: 'mesero'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

// Método para validar contraseña
Usuario.prototype.validarPassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = Usuario;

