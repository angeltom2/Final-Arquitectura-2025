// backend/src/models/usuario.model.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../lib/sequelize');

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
      'dir_comercial'
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
  timestamps: true,
  hooks: {
    // Antes de crear, encripta la contraseña
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  }
});

// Método personalizado para validar contraseña
Usuario.prototype.validarPassword = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = Usuario;
