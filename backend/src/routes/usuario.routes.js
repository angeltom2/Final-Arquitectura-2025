// backend/src/routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Todas protegidas y solo para admin
router.use(verifyToken);
router.use(verifyRole(['admin']));

router.get('/', usuarioCtrl.getUsuarios);
router.post('/', usuarioCtrl.createUsuario);
router.put('/:id', usuarioCtrl.updateUsuario);
router.delete('/:id', usuarioCtrl.deleteUsuario);

module.exports = router;
