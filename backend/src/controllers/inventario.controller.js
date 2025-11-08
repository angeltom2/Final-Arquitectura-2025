// backend/src/controllers/inventario.controller.js
const Producto = require("../models/product.model");
const MovimientoInventario = require("../models/movimientoInventario.model");
const { Op, literal } = require("sequelize");

// 📦 Obtener todos los productos con su stock actual
exports.getInventario = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      order: [["nombre", "ASC"]],
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({ message: "Error al obtener el inventario" });
  }
};

// ➕ Crear un nuevo producto (solo admin)
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, categoria, unidad, stock_actual, stock_minimo, precio_unitario } = req.body;

    // Validar si ya existe
    const productoExistente = await Producto.findOne({ where: { nombre } });
    if (productoExistente)
      return res.status(400).json({ message: "Producto ya existe" });

    // Crear producto
    const nuevoProducto = await Producto.create({
      nombre,
      categoria,
      unidad,
      stock_actual,
      stock_minimo,
      precio_unitario,
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear producto" });
  }
};

// 📥 Registrar entrada o salida de stock
exports.registrarMovimiento = async (req, res) => {
  try {
    const { productoId, tipo, cantidad, descripcion } = req.body;

    const producto = await Producto.findByPk(productoId);
    if (!producto)
      return res.status(404).json({ message: "Producto no encontrado" });

    // Actualizar stock
    let nuevoStock =
      tipo === "entrada"
        ? producto.stock_actual + cantidad
        : producto.stock_actual - cantidad;

    if (nuevoStock < 0)
      return res.status(400).json({ message: "No hay suficiente stock para esta salida" });

    await producto.update({ stock_actual: nuevoStock });

    // Crear el movimiento
    const movimiento = await MovimientoInventario.create({
      productoId,
      tipo,
      cantidad,
      descripcion,
    });

    res.status(201).json({
      message: "Movimiento registrado correctamente",
      movimiento,
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    res.status(500).json({ message: "Error al registrar el movimiento" });
  }
};

// 🚨 Productos con stock bajo
exports.alertasStock = async (req, res) => {
  try {
    const alertas = await Producto.findAll({
      where: {
        stock_actual: {
          [Op.lte]: literal("stock_minimo"),
        },
      },
    });
    res.json(alertas);
  } catch (error) {
    console.error("Error al obtener alertas:", error);
    res.status(500).json({ message: "Error al obtener alertas de stock" });
  }
};

// 📜 Historial de movimientos
exports.getMovimientos = async (req, res) => {
  try {
    const movimientos = await MovimientoInventario.findAll({
      include: [{ model: Producto, attributes: ["nombre", "unidad"] }],
      order: [["fecha", "DESC"]],
    });
    res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    res.status(500).json({ message: "Error al obtener movimientos" });
  }
};
