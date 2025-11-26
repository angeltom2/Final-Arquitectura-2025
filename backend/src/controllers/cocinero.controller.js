// backend/src/controllers/cocinero.controller.js
const { Pedido, DetallePedido } = require("../models/pedido.model");
const Plato = require("../models/Plato");

// Obtener pedidos pendientes o aceptados
exports.getPedidosPendientes = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: {
        estado: ["pendiente", "aceptado"] // solo estos estados ve el cocinero
      },
      include: [
        {
          model: DetallePedido,
          as: "detalle",
          include: [
            { model: Plato, as: "plato", attributes: ["nombre", "precio_venta"] }
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedidos", error: error.message });
  }
};

// Marcar pedido como listo
exports.marcarPedidoListo = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    pedido.estado = "listo"; // ✅ nuevo estado
    await pedido.save();

    const pedidoActualizado = await Pedido.findByPk(pedido.id, {
      include: [
        {
          model: DetallePedido,
          as: "detalle",
          include: [
            { model: Plato, as: "plato", attributes: ["nombre", "precio_venta"] }
          ],
        },
      ],
    });

    res.json({ message: "Pedido marcado como listo", pedido: pedidoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar pedido", error: error.message });
  }
};
