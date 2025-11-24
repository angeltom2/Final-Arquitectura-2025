const express = require('express');
const router = express.Router();
const cotizacionCtrl = require('../controllers/cotizacion.controller');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.use(verifyToken);

// Auxiliar puede crear y listar
router.post('/', verifyRole(['aux_compras', 'admin']), cotizacionCtrl.createCotizacion);
router.get('/', verifyRole(['aux_compras', 'admin','dir_compras']), cotizacionCtrl.getCotizaciones);
router.get('/:id', verifyRole(['aux_compras', 'admin','dir_compras']), cotizacionCtrl.getCotizacion);

// Enviar / actualizar estado
router.put('/:id/estado', verifyRole(['admin','aux_compras']), cotizacionCtrl.updateEstado);

// Solo admin puede borrar
router.delete('/:id', verifyRole(['admin']), cotizacionCtrl.deleteCotizacion);

module.exports = router;
