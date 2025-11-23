// backend/src/controllers/director.controller.js
const Cotizacion = require('../models/cotizacion.model');
const ValorCotizacion = require('../models/valorCotizacion.model');
const OrdenCompra = require('../models/ordenCompra.model');
const Solicitud = require('../models/solicitud.model');

exports.registrarValores = async (req, res) => {
  try {
    const user = req.user; // debe tener rol director_comercial o admin
    const cotizacionId = Number(req.params.id);
    const { valores } = req.body; // [{ productoId, nombre, precioUnitario }]

    if (!Array.isArray(valores) || valores.length === 0) {
      return res.status(400).json({ message: 'Debe enviar valores para los productos' });
    }

    const cot = await Cotizacion.findByPk(cotizacionId);
    if (!cot) return res.status(404).json({ message: 'Cotización no encontrada' });

    // No permitir si cotización está en estado final (rechazada/opcionada)
    const finalStates = ['rechazada','opcionada'];
    if (finalStates.includes(cot.estado)) {
      return res.status(400).json({ message: `No se pueden registrar valores para cotización en estado '${cot.estado}'` });
    }

    // Comprobar que la cantidad de valores concuerde con la cantidad de productos de la cotización
    if (!Array.isArray(cot.productos)) cot.productos = [];
    if (valores.length !== cot.productos.length) {
      // permitimos sin forzar igualdad, pero advertimos — preferimos requerir igualdad
      return res.status(400).json({ message: 'La lista de valores debe corresponder a los productos de la cotización' });
    }

    // Guardar los valores
    const registro = await ValorCotizacion.create({
      cotizacionId,
      valores,
      registradoPor: user.id
    });

    return res.status(201).json({ message: 'Valores registrados correctamente', registro });
  } catch (err) {
    console.error('❌ ERROR registrarValores:', err);
    return res.status(500).json({ message: 'Error registrando valores', error: err.message });
  }
};

exports.validarCotizacion = async (req, res) => {
  try {
    const user = req.user;
    const cotizacionId = Number(req.params.id);
    const { estado } = req.body; // 'rechazada' | 'sospechosa' | 'opcionada'
    const allowed = ['rechazada','sospechosa','opcionada'];

    if (!allowed.includes(estado)) return res.status(400).json({ message: 'Estado inválido para validación' });

    const cot = await Cotizacion.findByPk(cotizacionId);
    if (!cot) return res.status(404).json({ message: 'Cotización no encontrada' });

    // Solo validar si hay valores registrados
    const values = await ValorCotizacion.findOne({ where: { cotizacionId } });
    if (!values) {
      return res.status(400).json({ message: 'No hay valores registrados para esta cotización' });
    }

    // No volver a validar si ya está en estado final (opcionada o rechazada)
    if (['rechazada','opcionada'].includes(cot.estado) && cot.estado === estado) {
      return res.status(400).json({ message: `Cotización ya se encuentra en estado '${cot.estado}'` });
    }

    await cot.update({ estado });

    return res.json({ message: 'Cotización validada', cotizacion: cot });
  } catch (err) {
    console.error('❌ ERROR validarCotizacion:', err);
    return res.status(500).json({ message: 'Error validando cotización', error: err.message });
  }
};

exports.generarOrdenCompra = async (req, res) => {
  try {
    const user = req.user;
    const cotizacionId = Number(req.body.cotizacionId);

    if (!cotizacionId) return res.status(400).json({ message: 'cotizacionId requerido' });

    const cot = await Cotizacion.findByPk(cotizacionId);
    if (!cot) return res.status(404).json({ message: 'Cotización no encontrada' });

    if (cot.estado !== 'opcionada') {
      return res.status(400).json({ message: 'Solo se puede generar orden a partir de una cotización opcionada' });
    }

    // Obtener valores registrados
    const registro = await ValorCotizacion.findOne({ where: { cotizacionId } });
    if (!registro) return res.status(400).json({ message: 'No hay valores registrados para esta cotización' });

    // Construir productos con precio y subtotal
    const productosFromCot = cot.productos || [];
    const valores = registro.valores || [];

    // Asumimos que valores y productos mantienen la misma posición (se validó antes)
    const productosOC = productosFromCot.map((p, idx) => {
      const v = valores[idx] || {};
      const precio = Number(v.precioUnitario || 0);
      const cantidad = Number(p.cantidad || 0);
      const subtotal = precio * cantidad;
      return {
        productoId: p.productoId ?? null,
        nombre: p.nombre,
        cantidad,
        unidad: p.unidad || null,
        precioUnitario: precio,
        subTotal: subtotal
      };
    });

    const total = productosOC.reduce((acc, x) => acc + (Number(x.subTotal) || 0), 0);

    const orden = await OrdenCompra.create({
      cotizacionId,
      proveedor: cot.proveedor,
      productos: productosOC,
      total,
      creadoPor: user.id
    });

    return res.status(201).json({ message: 'Orden de compra generada', orden });
  } catch (err) {
    console.error('❌ ERROR generarOrdenCompra:', err);
    return res.status(500).json({ message: 'Error generando orden de compra', error: err.message });
  }
};
