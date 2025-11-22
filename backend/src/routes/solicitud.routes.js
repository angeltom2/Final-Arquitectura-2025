// backend/src/routes/solicitud.routes.js
const express = require('express');
const router = express.Router();
const solicitudCtrl = require('../controllers/solicitud.controller');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Todas requieren token
router.use(verifyToken);

// Jefe de cocina crea solicitud
router.post('', verifyRole(['jefe_cocina','admin']), solicitudCtrl.createSolicitud);

// Obtener (filtro: jefe ve solo suyas)
router.get('', verifyRole(['admin','jefe_cocina','aux_compras','director_comercial']), solicitudCtrl.getSolicitudes);

// Obtener una
router.get('/:id', verifyRole(['admin','jefe_cocina','aux_compras','director_comercial']), solicitudCtrl.getSolicitud);

// Actualizar estado (solo aux_compras y admin pueden aprobar/rechazar; admin también)
router.put('/:id/estado', verifyRole(['aux_compras','admin']), solicitudCtrl.updateEstado);

// Borrar (solo admin)
router.delete('/:id', verifyRole(['admin']), solicitudCtrl.deleteSolicitud);

module.exports = router;
