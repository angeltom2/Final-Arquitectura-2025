// backend/src/routes/pedido.routes.js
const express = require("express");
const router = express.Router();
const pedidoCtrl = require("../controllers/pedido.controller");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

// Solo usuarios autenticados
router.use(verifyToken);

// CRUD de pedidos
router.get("/",verifyRole(["admin", "mesero", "dir_comercial","cocinero"]), pedidoCtrl.getPedidos); // listar todos
router.get("/:id",verifyRole(["admin", "mesero", "dir_comercial","cocinero"]), pedidoCtrl.getPedido); // obtener 1
router.post("/", verifyRole(["admin", "mesero","cocinero"]), pedidoCtrl.crearPedido); // crear pedido
router.put("/:id", verifyRole(["admin", "mesero","cocinero"]), pedidoCtrl.actualizarPedido); // actualizar pedido
router.delete("/:id", verifyRole(["admin", "mesero","cocinero"]), pedidoCtrl.eliminarPedido); // eliminar pedido

module.exports = router;
