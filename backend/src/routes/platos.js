const express = require("express");
const router = express.Router();
const platoCtrl = require("../controllers/platoController");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

router.use(verifyToken);

// Crear plato
router.post("/", verifyRole(["jefe_cocina", "admin"]), platoCtrl.createPlato);

// Listar todos los platos
router.get("/", verifyRole(["jefe_cocina", "admin"]), platoCtrl.getPlatos);

// Obtener un plato por ID
router.get("/:id", verifyRole(["jefe_cocina", "admin"]), platoCtrl.getPlatoById);

// Actualizar plato
router.put("/:id", verifyRole(["jefe_cocina", "admin"]), platoCtrl.updatePlato);

// Eliminar plato
router.delete("/:id", verifyRole(["jefe_cocina", "admin"]), platoCtrl.deletePlato);

module.exports = router;
