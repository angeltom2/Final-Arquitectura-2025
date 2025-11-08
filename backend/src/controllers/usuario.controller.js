// backend/src/controllers/usuario.controller.js
const Usuario = require('../models/usuario.model');
const bcrypt = require('bcryptjs');

// 📍 Listar todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo'],
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

// 📍 Crear nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ message: 'El email ya está registrado' });

    const hashed = await bcrypt.hash(contraseña, 10);

    const usuario = await Usuario.create({
      nombre,
      email,
      password_hash: hashed,
      rol,
      activo: true,
    });

    res.status(201).json({ message: 'Usuario creado correctamente', usuario });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
};

// 📍 Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, contraseña, rol, activo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (contraseña) {
      usuario.password_hash = await bcrypt.hash(contraseña, 10);
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    usuario.rol = rol || usuario.rol;
    usuario.activo = activo ?? usuario.activo;

    await usuario.save();
    res.json({ message: 'Usuario actualizado', usuario });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

// 📍 Eliminar usuario (borrado lógico)
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    usuario.activo = false;
    await usuario.save();
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err.message });
  }
};
