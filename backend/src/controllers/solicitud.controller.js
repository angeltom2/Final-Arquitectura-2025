
const Solicitud = require('../models/solicitud.model');
const Producto = require('../models/product.model');
const MovimientoInventario = require('../models/movimientoInventario.model');


exports.createSolicitud = async (req, res) => {
  try {
    const usuario = req.user; // viene del verifyToken
    const { productos, observaciones } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Se requiere al menos un producto' });
    }

    // ✔ Asignar un nombre por rol, para evitar NULL
    let solicitanteNombre = "Usuario";

    if (usuario.rol === "admin") solicitanteNombre = "Administrador";
    if (usuario.rol === "jefe_cocina") solicitanteNombre = "Jefe de Cocina";
    if (usuario.rol === "aux_compras") solicitanteNombre = "Auxiliar de Compras";
    if (usuario.rol === "director_comercial") solicitanteNombre = "Director Comercial";

    const solicitud = await Solicitud.create({
      solicitanteNombre,     // ← Nunca será null
      solicitanteId: usuario.id,
      productos,
      observaciones,
      estado: "pendiente"
    });

    return res.status(201).json({
      message: 'Solicitud creada correctamente',
      solicitud
    });

  } catch (err) {
    console.error("💥 ERROR CREANDO SOLICITUD:", err);
    return res.status(500).json({ message: 'Error creando solicitud', error: err.message });
  }
};



exports.getSolicitudes = async (req, res) => {
  try {
    const user = req.user;
    let where = {};

    // Jefe cocina → solo ve las suyas
    if (user.rol === 'jefe_cocina') {
      where = { solicitanteId: user.id };
    }

    const lista = await Solicitud.findAll({
      where,
      order: [['fechaSolicitud', 'DESC']]
    });

    return res.json(lista);

  } catch (err) {
    console.error("❌ ERROR LISTANDO SOLICITUDES:", err);
    return res.status(500).json({ message: 'Error obteniendo solicitudes' });
  }
};


exports.getSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByPk(req.params.id);
    if (!solicitud)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    return res.json(solicitud);

  } catch (err) {
    console.error("❌ ERROR OBTENIENDO SOLICITUD:", err);
    return res.status(500).json({ message: 'Error' });
  }
};


exports.updateEstado = async (req, res) => {
  try {
    const { estado, observaciones, proveedorSeleccionado } = req.body;

    const solicitud = await Solicitud.findByPk(req.params.id);
    if (!solicitud)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    const allowed = ['pendiente', 'aprobada', 'rechazada', 'completada'];
    if (!allowed.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    // ✔ Si pasa a completada → ingresar productos a inventario
    if (estado === 'completada') {
      const productos = solicitud.productos || [];

      for (const p of productos) {
        if (p.productoId) {
          const prod = await Producto.findByPk(p.productoId);
          if (prod) {
            const nuevoStock = Number(prod.stock_actual || 0) + Number(p.cantidad || 0);

            await prod.update({ stock_actual: nuevoStock });

            await MovimientoInventario.create({
              productoId: prod.id,
              tipo: 'entrada',
              cantidad: p.cantidad,
              descripcion: `Ingreso por solicitud ${solicitud.id} (proveedor: ${proveedorSeleccionado || 'N/A'})`
            });
          }
        }
      }
    }

    await solicitud.update({ estado, observaciones, proveedorSeleccionado });

    return res.json({
      message: 'Estado actualizado correctamente',
      solicitud
    });

  } catch (err) {
    console.error("❌ ERROR ACTUALIZANDO ESTADO:", err);
    return res.status(500).json({ message: 'Error actualizando estado' });
  }
};


exports.deleteSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findByPk(req.params.id);
    if (!solicitud)
      return res.status(404).json({ message: 'Solicitud no encontrada' });

    await solicitud.destroy();
    return res.json({ message: 'Solicitud eliminada' });

  } catch (err) {
    console.error("❌ ERROR ELIMINANDO SOLICITUD:", err);
    return res.status(500).json({ message: 'Error eliminando solicitud' });
  }
};
