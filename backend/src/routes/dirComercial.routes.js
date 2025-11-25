// backend/src/routes/dirComercial.routes.js
const express = require("express");
const router = express.Router();
const dirCtrl = require("../controllers/dirComercial.controller");
const { verifyToken, verifyRole } = require("../middlewares/authMiddleware");

// Solo usuarios autenticados
router.use(verifyToken);

// Dashboard - accesible a dir_comercial y admin
router.get(
  "/dashboard",
  verifyRole(["dir_comercial", "admin"]),
  dirCtrl.dashboard
);

module.exports = router;
