const express = require('express');
const { body } = require('express-validator');
const { login, register } = require('../controllers/auth.controller');

const router = express.Router();

// RUTA: Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contraseña').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  login
);

// RUTA: Registro
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('contraseña').isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
    body('rol').notEmpty().withMessage('El rol es obligatorio'),
  ],
  register
);

module.exports = router;
