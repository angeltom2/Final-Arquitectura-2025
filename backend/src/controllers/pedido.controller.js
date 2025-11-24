// backend/src/controllers/pedido.controller.js
const { Pedido, DetallePedido } = require("../models/pedido.model");
const Plato = require("../models/Plato");

// Obtener todos los pedidos con sus detalles
exports.getPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        {
          model: DetallePedido,
          as: "detalle",
          include: [
            { model: Plato, as: "plato", attributes: ["nombre", "precio_venta"] }
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

// Obtener un pedido específico
exports.getPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
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
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener pedido" });
  }
};

// Crear un pedido y su detalle
exports.crearPedido = async (req, res) => {
  try {
    const { mesa, detalles } = req.body; // detalles = [{ platoId: 7, cantidad: 2 }, ...]

    if (!detalles || !detalles.length)
      return res.status(400).json({ message: "Debe incluir al menos un detalle de pedido" });

    // Crear pedido
    const pedido = await Pedido.create({ mesa });

    // Crear detalles
    for (const det of detalles) {
      const plato = await Plato.findByPk(det.platoId);
      if (!plato) {
        await pedido.destroy(); // revertir si falla algún plato
        return res.status(404).json({ message: `Plato con id ${det.platoId} no encontrado` });
      }

      await DetallePedido.create({
        pedidoId: pedido.id,
        platoId: plato.id,
        cantidad: det.cantidad,
        precio_unitario: plato.precio_venta,
      });
    }

    // Traer pedido completo con detalles
    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
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

    res.status(201).json({ message: "Pedido creado", pedido: pedidoCompleto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear pedido" });
  }
};

// Actualizar pedido
exports.actualizarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    const { mesa, estado, detalles } = req.body;

    if (mesa) pedido.mesa = mesa;
    if (estado) pedido.estado = estado;
    await pedido.save();

    // Actualizar detalles si se envían
    if (detalles && detalles.length) {
      for (const det of detalles) {
        let detalle = await DetallePedido.findOne({
          where: { pedidoId: pedido.id, platoId: det.platoId },
        });

        if (detalle) {
          detalle.cantidad = det.cantidad;
          await detalle.save();
        } else {
          const plato = await Plato.findByPk(det.platoId);
          if (!plato) continue;
          await DetallePedido.create({
            pedidoId: pedido.id,
            platoId: plato.id,
            cantidad: det.cantidad,
            precio_unitario: plato.precio_venta,
          });
        }
      }
    }

    // Traer pedido actualizado con detalles
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

    res.json({ message: "Pedido actualizado", pedido: pedidoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar pedido" });
  }
};

// Eliminar pedido
exports.eliminarPedido = async (req, res) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    await DetallePedido.destroy({ where: { pedidoId: pedido.id } });
    await pedido.destroy();

    res.json({ message: "Pedido eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar pedido" });
  }
};
