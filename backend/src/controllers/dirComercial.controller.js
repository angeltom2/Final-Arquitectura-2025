// backend/src/controllers/dirComercial.controller.js
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const { Pedido, DetallePedido } = require("../models/pedido.model");
const Plato = require("../models/Plato");
const PlatoIngrediente = require("../models/PlatoIngrediente");
const Producto = require("../models/product.model");

// Helper: intenta cargar un modelo opcional
function tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
}

exports.dashboard = async (req, res) => {
  try {
    // -------------------------
    // 🔥 1) Tomar rango del mes solicitado
    // -------------------------
    const now = new Date();
    const mes = Number(req.query.mes) || now.getMonth() + 1; // 1-12
    const anio = Number(req.query.anio) || now.getFullYear();

    // Primer día del mes
    const fechaInicio = new Date(anio, mes - 1, 1, 0, 0, 0);

    // Último día del mes
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

    // -------------------------
    // 2) Top platos vendidos del mes
    // -------------------------
    const ventasPlatos = await DetallePedido.findAll({
      attributes: [
        "platoId",
        [fn("SUM", col("cantidad")), "total_vendido"],
      ],
      where: { createdAt: { [Op.between]: [fechaInicio, fechaFin] } },
      include: [
        { model: Plato, as: "plato", attributes: ["id", "nombre", "precio_venta"] },
      ],
      group: ["platoId", "plato.id", "plato.nombre", "plato.precio_venta"],
      order: [[fn("SUM", col("cantidad")), "DESC"]],
      limit: 10,
      raw: false,
    });

    const productoMasDemandadoPlato = ventasPlatos.length ? {
      platoId: ventasPlatos[0].platoId,
      nombre: ventasPlatos[0].plato?.nombre || null,
      precio_venta: ventasPlatos[0].plato?.precio_venta || null,
      total_vendido: Number(ventasPlatos[0].get("total_vendido") || 0),
      top10: ventasPlatos.map(v => ({
        platoId: v.platoId,
        nombre: v.plato?.nombre || null,
        total_vendido: Number(v.get("total_vendido") || 0),
      })),
    } : null;

    // -------------------------
    // 3) Ingredientes usados en el mes
    // -------------------------
    const detallesRecientes = await DetallePedido.findAll({
      where: { createdAt: { [Op.between]: [fechaInicio, fechaFin] } },
      include: [
        {
          model: Plato,
          as: "plato",
          attributes: ["id", "nombre"],
          include: [
            {
              model: PlatoIngrediente,
              as: "ingredientes",
              attributes: ["producto_id", "cantidad", "unidad"],
              include: [{ model: Producto, as: "producto", attributes: ["id", "nombre", "unidad"] }],
            },
          ],
        },
      ],
    });

    const usoIngredientes = {};
    for (const det of detallesRecientes) {
      const cantidadPedido = Number(det.cantidad || 0);
      const plato = det.plato;
      const ingredientes = plato?.ingredientes || [];

      for (const ing of ingredientes) {
        const prodId = Number(ing.producto_id || ing.product?.id);
        if (!prodId) continue;

        const uso = Number(ing.cantidad || 0) * cantidadPedido;

        if (!usoIngredientes[prodId]) {
          usoIngredientes[prodId] = {
            productoId: prodId,
            nombre: ing.producto?.nombre || "Desconocido",
            unidad: ing.unidad || ing.producto?.unidad || "",
            total_usado: 0,
          };
        }

        usoIngredientes[prodId].total_usado += uso;
      }
    }

    const ingredientesOrdenados = Object.values(usoIngredientes)
      .sort((a, b) => b.total_usado - a.total_usado);

    const ingredienteMasUsado = ingredientesOrdenados[0] || null;

    // -------------------------
    // 4) Restaurante top del mes
    // -------------------------
    let restauranteTop = null;

    if (Pedido.rawAttributes.restauranteId) {
      const ventasRest = await Pedido.findAll({
        attributes: ["restauranteId", [fn("COUNT", col("id")), "total_pedidos"]],
        where: { createdAt: { [Op.between]: [fechaInicio, fechaFin] } },
        group: ["restauranteId"],
        order: [[literal("total_pedidos"), "DESC"]],
        limit: 1,
      });

      if (ventasRest.length) {
        restauranteTop = {
          restauranteId: ventasRest[0].restauranteId,
          total_pedidos: Number(ventasRest[0].get("total_pedidos")),
        };
      }
    } else {
      // fallback por mesa
      const ventasMesa = await Pedido.findAll({
        attributes: ["mesa", [fn("COUNT", col("id")), "total_pedidos"]],
        where: { createdAt: { [Op.between]: [fechaInicio, fechaFin] } },
        group: ["mesa"],
        order: [[literal("total_pedidos"), "DESC"]],
        limit: 3,
      });

      restauranteTop = {
        notice: "No existe campo restauranteId. Se muestra top por mesa como fallback.",
        topMesas: ventasMesa.map(v => ({
          mesa: v.mesa,
          total_pedidos: Number(v.get("total_pedidos")),
        })),
      };
    }

    // -------------------------
    // 5) Proveedor con mejores precios (último año)
    // -------------------------
    let proveedorTop = null;
    const Compra = tryRequire("../models/compra.model");

    if (Compra) {
      const inicioAnio = new Date(anio - 1, mes - 1, 1);

      const promedios = await Compra.findAll({
        attributes: [
          "proveedorId",
          [fn("AVG", col("precio")), "precio_promedio"],
          [fn("COUNT", col("id")), "compras_count"],
        ],
        where: { fecha: { [Op.gte]: inicioAnio } },
        group: ["proveedorId"],
        order: [[literal("precio_promedio"), "ASC"]],
        limit: 10,
      });

      proveedorTop = promedios.length
        ? promedios.map(p => ({
            proveedorId: p.proveedorId,
            precio_promedio: Number(p.get("precio_promedio")),
            compras_count: Number(p.get("compras_count")),
          }))
        : { notice: "No hay compras en el último año." };
    } else {
      proveedorTop = { notice: "Modelo Compra no encontrado." };
    }

    // -------------------------
    // 6) KPIs del mes
    // -------------------------
    const totalPedidosMes = await Pedido.count({
      where: { createdAt: { [Op.between]: [fechaInicio, fechaFin] } },
    });

    const totalPlatosVendidosMesRow = await DetallePedido.findOne({
      attributes: [[fn("SUM", col("cantidad")), "total_platos_vendidos"]],
      where: { createdAt: { [Op.between]: [fechaInicio, fechaFin] } },
      raw: true,
    });

    const totalPlatosVendidosMes =
      Number(totalPlatosVendidosMesRow?.total_platos_vendidos || 0);

    // -------------------------
    // 7) Respuesta final
    // -------------------------
    return res.json({
      rango: { mes, anio },
      productoMasDemandadoPlato,
      ingredienteMasUsado,
      restauranteTop,
      proveedorTop,
      kpis: {
        totalPedidosMes,
        totalPlatosVendidosMes,
        fechaGenerado: new Date(),
      },
    });
  } catch (error) {
    console.error("Error director comercial dashboard:", error);
    return res.status(500).json({ message: "Error generando dashboard" });
  }
};
