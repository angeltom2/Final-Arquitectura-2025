const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/usuario.model');

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, contraseña } = req.body;

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(contraseña, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno en login' });
  }
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nombre, email, contraseña, rol } = req.body;

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password_hash: hashedPassword,
      rol,
    });

    res.status(201).json({ message: 'Usuario registrado', usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno en registro' });
  }
};
