// backend/src/routes/pedido.routes.js
const express = require("express");
const router = express.Router();
const pedidoCtrl = require("../controllers/pedido.controller");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

// Solo usuarios autenticados
router.use(verifyToken);

// CRUD de pedidos
router.get("/", pedidoCtrl.getPedidos); // listar todos
router.get("/:id", pedidoCtrl.getPedido); // obtener 1
router.post("/", verifyRole(["admin", "mesero"]), pedidoCtrl.crearPedido); // crear pedido
router.put("/:id", verifyRole(["admin", "mesero"]), pedidoCtrl.actualizarPedido); // actualizar pedido
router.delete("/:id", verifyRole(["admin", "mesero"]), pedidoCtrl.eliminarPedido); // eliminar pedido

module.exports = router;
