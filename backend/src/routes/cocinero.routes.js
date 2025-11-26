// backend/src/routes/cocinero.routes.js
const express = require("express");
const router = express.Router();
const cocineroCtrl = require("../controllers/cocinero.controller");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

// 🔒 Solo usuarios autenticados con rol "cocinero"
router.use(verifyToken);
router.use(verifyRole(["cocinero","admin"]));

// 📋 Listar pedidos pendientes o aceptados
router.get("/pedidos", cocineroCtrl.getPedidosPendientes);

// ✅ Marcar un pedido como listo
router.put("/pedidos/:id/listo", cocineroCtrl.marcarPedidoListo);

module.exports = router;
