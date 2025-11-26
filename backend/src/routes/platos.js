const express = require("express");
const router = express.Router();
const platoCtrl = require("../controllers/platoController");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

router.use(verifyToken);

// Crear plato
router.post("/", verifyRole(["jefe_cocina", "admin", "dir_comercial"]), platoCtrl.createPlato);

// Listar todos los platos
router.get("/", verifyRole(["jefe_cocina", "admin", "mesero", "dir_comercial","cocinero"]), platoCtrl.getPlatos);

// Obtener un plato por ID
router.get("/:id", verifyRole(["jefe_cocina", "admin", "mesero","cocinero"]), platoCtrl.getPlatoById);

// Actualizar plato
router.put("/:id", verifyRole(["jefe_cocina", "admin","cocinero"]), platoCtrl.updatePlato);

// Eliminar plato
router.delete("/:id", verifyRole(["jefe_cocina", "admin"]), platoCtrl.deletePlato);

module.exports = router;
