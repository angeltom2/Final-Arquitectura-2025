// backend/src/controllers/dirComercial.controller.js
const { Op, fn, col, literal, Sequelize } = require("sequelize");
const { Pedido, DetallePedido } = require("../models/pedido.model");
const Plato = require("../models/Plato");
const PlatoIngrediente = require("../models/PlatoIngrediente");
const Producto = require("../models/product.model");

// Helper: intenta cargar un modelo opcional (Compra, Restaurante, Proveedor...)
function tryRequire(path) {
  try {
    return require(path);
  } catch (e) {
    return null;
  }
}

/**
 * GET /analitica/dir-comercial/dashboard
 * Devuelve:
 *  - productoMasDemandadoUltimoMes (por plato y por ingrediente)
 *  - restauranteConMayorDemandaUltimoMes (si existe campo / modelo, si no fallback)
 *  - proveedorConMejoresPreciosUltimoAnio (si existe modelo Compra)
 *  - KPIs generales simples (totalPedidosMes, totalPlatosVendidosMes)
 */
exports.dashboard = async (req, res) => {
  try {
    const now = new Date();
    const desdeUltimoMes = new Date(now);
    desdeUltimoMes.setMonth(now.getMonth() - 1);

    // -------------------------
    // 1) Producto / Plato con mayor demanda (último mes) - por platos vendidos
    // -------------------------
    // Usamos DetallePedido para agrupar por platoId y sumar cantidades
    const ventasPlatos = await DetallePedido.findAll({
      attributes: [
        "platoId",
        [fn("SUM", col("cantidad")), "total_vendido"],
      ],
      where: {
        createdAt: { [Op.gte]: desdeUltimoMes },
      },
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
    // 1b) Ingredientes más usados (convertir ventas de platos -> ingredientes usados)
    // -------------------------
    // Para esto: traer los detalles de pedidos del último mes con el plato y sus ingredientes
    const detallesRecientes = await DetallePedido.findAll({
      where: { createdAt: { [Op.gte]: desdeUltimoMes } },
      include: [
        {
          model: Plato,
          as: "plato",
          attributes: ["id", "nombre"],
          include: [
            {
              model: PlatoIngrediente,
              as: "ingredientes", // alias que usa tu controlador de platos
              attributes: ["producto_id", "cantidad", "unidad"],
              include: [{ model: Producto, as: "producto", attributes: ["id", "nombre", "unidad"] }],
            },
          ],
        },
      ],
    });

    // Mapear total uso por producto_id
    const usoIngredientes = {}; // producto_id -> { nombre, total }
    for (const det of detallesRecientes) {
      const cantidadPedido = Number(det.cantidad || 0);
      const plato = det.plato;
      const ingredientes = (plato && plato.ingredientes) ? plato.ingredientes : [];
      for (const ing of ingredientes) {
        const prodId = Number(ing.producto_id || ing.productId || ing.product?.id);
        const ingCantidadPorPlato = Number(ing.cantidad || 0);
        // uso total = ingCantidadPorPlato * cantidadPedido
        if (!prodId) continue;
        const uso = ingCantidadPorPlato * cantidadPedido;
        if (!usoIngredientes[prodId]) {
          usoIngredientes[prodId] = {
            productoId: prodId,
            nombre: ing.producto?.nombre || ing.producto?.nombre || "Desconocido",
            unidad: ing.unidad || ing.producto?.unidad || "",
            total_usado: 0,
          };
        }
        usoIngredientes[prodId].total_usado += uso;
      }
    }
    // convertir a arreglo y ordenar
    const ingredientesOrdenados = Object.values(usoIngredientes).sort((a, b) => b.total_usado - a.total_usado);
    const ingredienteMasUsado = ingredientesOrdenados.length ? ingredientesOrdenados[0] : null;

    // -------------------------
    // 2) Restaurante con mayor demanda en último mes
    // -------------------------
    // (fallback: si existe campo restauranteId en Pedido lo usa; si no, agrupamos por 'mesa' como aproximación)
    let restauranteTop = null;
    const PedidoModel = Pedido;
    if (PedidoModel.rawAttributes && PedidoModel.rawAttributes.restauranteId) {
      // Agrupar por restauranteId
      const ventasRest = await PedidoModel.findAll({
        attributes: [
          "restauranteId",
          [fn("COUNT", col("id")), "total_pedidos"],
        ],
        where: {
          createdAt: { [Op.gte]: desdeUltimoMes },
        },
        group: ["restauranteId"],
        order: [[fn("COUNT", col("id")), "DESC"]],
        limit: 1,
      });
      if (ventasRest.length) {
        restauranteTop = {
          restauranteId: ventasRest[0].restauranteId,
          total_pedidos: Number(ventasRest[0].get("total_pedidos") || 0),
        };
      }
    } else {
      // Fallback agrupar por 'mesa' para dar alguna métrica (no ideal si varias mesas son del mismo local)
      const ventasMesa = await PedidoModel.findAll({
        attributes: [
          "mesa",
          [fn("COUNT", col("id")), "total_pedidos"],
        ],
        where: { createdAt: { [Op.gte]: desdeUltimoMes } },
        group: ["mesa"],
        order: [[fn("COUNT", col("id")), "DESC"]],
        limit: 3,
      });
      restauranteTop = {
        notice: "No existe campo restauranteId. Se muestra top por mesa como fallback.",
        topMesas: ventasMesa.map(v => ({ mesa: v.mesa, total_pedidos: Number(v.get("total_pedidos") || 0) })),
      };
    }

    // -------------------------
    // 3) Proveedor con mejores precios (último año)
    // -------------------------
    // Para esto intentamos cargar un modelo 'Compra' o 'CompraModel' que contenga precio, proveedorId y fecha
    let proveedorTop = null;
    const Compra = tryRequire("../models/compra.model") || tryRequire("../models/Compra");
    if (Compra) {
      const desdeUltimoAnio = new Date(now);
      desdeUltimoAnio.setFullYear(now.getFullYear() - 1);

      // promedio precio por proveedor en el último año
      const promedios = await Compra.findAll({
        attributes: [
          "proveedorId",
          [fn("AVG", col("precio")), "precio_promedio"],
          [fn("COUNT", col("id")), "compras_count"],
        ],
        where: {
          fecha: { [Op.gte]: desdeUltimoAnio },
        },
        group: ["proveedorId"],
        order: [[fn("AVG", col("precio")), "ASC"]], // menor promedio -> mejor precio
        limit: 10,
      });

      // Construir resultado: top proveedor (si hay)
      if (promedios.length) {
        proveedorTop = promedios.map(p => ({
          proveedorId: p.proveedorId,
          precio_promedio: Number(p.get("precio_promedio") || 0),
          compras_count: Number(p.get("compras_count") || 0),
        }));
      } else {
        proveedorTop = { notice: "No hay compras en el último año" };
      }
    } else {
      proveedorTop = { notice: "Modelo Compra no encontrado; no se puede calcular proveedor con mejores precios." };
    }

    // -------------------------
    // KPIs generales
    // -------------------------
    const totalPedidosMes = await Pedido.count({ where: { createdAt: { [Op.gte]: desdeUltimoMes } } });

    const totalPlatosVendidosMesRow = await DetallePedido.findOne({
      attributes: [[fn("SUM", col("cantidad")), "total_platos_vendidos"]],
      where: { createdAt: { [Op.gte]: desdeUltimoMes } },
      raw: true,
    });
    const totalPlatosVendidosMes = Number(totalPlatosVendidosMesRow?.total_platos_vendidos || 0);

    // -------------------------
    // Respuesta agregada
    // -------------------------
    return res.json({
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
