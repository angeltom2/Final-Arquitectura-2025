// backend/src/routes/director.routes.js
const express = require('express');
const router = express.Router();
const directorCtrl = require('../controllers/director.controller');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Solo director_comercial y admin
router.use(verifyToken);
router.use(verifyRole(['dir_compras', 'admin']));

// Registrar valores para una cotización (POST)
router.post('/cotizacion/:id/registrar-valores', directorCtrl.registrarValores);

// Validar cotización (PUT)
router.put('/cotizacion/:id/validar', directorCtrl.validarCotizacion);

// Generar orden de compra (POST)
router.post('/orden-compra', directorCtrl.generarOrdenCompra);

module.exports = router;
