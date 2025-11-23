// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/usuario.model');

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(contraseña, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "8h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno en login" });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "El usuario ya existe" });

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash: hash,
      rol,
    });

    res.status(201).json({
      message: "Usuario registrado",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error interno en registro" });
  }
};
