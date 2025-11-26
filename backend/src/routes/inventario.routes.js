const express = require("express");
const router = express.Router();
const inventarioCtrl = require("../controllers/inventario.controller");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

// 🔒 Solo usuarios autenticados pueden acceder
router.use(verifyToken);

// 📦 Consultar inventario (todos los roles pueden ver)
router.get("/", inventarioCtrl.getInventario);

// ➕ Crear producto (solo admin)
router.post(
  "/", 
  verifyRole(["admin"]),
  inventarioCtrl.crearProducto
);

// ✏️ Editar producto (solo admin)
router.put(
  "/:id",
  verifyRole(["admin"]),
  inventarioCtrl.editarProducto
);

// 🗑 Eliminar producto (solo admin)
router.delete(
  "/:id",
  verifyRole(["admin"]),
  inventarioCtrl.eliminarProducto
);

// 🧾 Registrar movimiento (solo admin, jefe cocina, auxiliar de compras)
router.post(
  "/movimiento",
  verifyRole(["admin", "jefe_cocina", "aux_compras"]),
  inventarioCtrl.registrarMovimiento
);

// 🚨 Ver alertas de bajo stock (admin y jefe cocina)
router.get(
  "/alertas",
  verifyRole(["admin", "jefe_cocina"]),
  inventarioCtrl.alertasStock
);

// 📜 Historial de movimientos (solo admin)
router.get(
  "/movimientos",
  verifyRole(["admin"]),
  inventarioCtrl.getMovimientos
);

module.exports = router;
