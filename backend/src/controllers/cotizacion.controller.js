const Cotizacion = require('../models/cotizacion.model');
const Solicitud = require('../models/solicitud.model');

exports.createCotizacion = async (req, res) => {
  try {
    const { solicitudId, proveedor, fecha_limite, productos, notas } = req.body;

    if (!solicitudId || !proveedor || !fecha_limite || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos para generar cotización' });
    }

    const solicitud = await Solicitud.findByPk(solicitudId);
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada' });

    const cotizacion = await Cotizacion.create({
      solicitudId,
      proveedor,
      fecha_limite,
      productos,
      notas,
    });

    return res.status(201).json({ message: 'Cotización creada', cotizacion });
  } catch (err) {
    console.error('💥 ERROR CREANDO COTIZACION:', err);
    return res.status(500).json({ message: 'Error creando cotización', error: err.message });
  }
};

exports.getCotizaciones = async (req, res) => {
  try {
    const user = req.user;
    let where = {};

    // Auxiliar ve todas las cotizaciones
    if (user.rol === 'aux_compras') {
      // Opcional: filtrar solo las relacionadas con solicitudes que puede ver
    }

    const lista = await Cotizacion.findAll({
      where,
      order: [['fechaCreacion', 'DESC']]
    });

    return res.json(lista);
  } catch (err) {
    console.error('❌ ERROR LISTANDO COTIZACIONES:', err);
    return res.status(500).json({ message: 'Error obteniendo cotizaciones' });
  }
};

exports.getCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'Cotización no encontrada' });

    return res.json(cotizacion);
  } catch (err) {
    console.error('❌ ERROR OBTENIENDO COTIZACION:', err);
    return res.status(500).json({ message: 'Error obteniendo cotización' });
  }
};

exports.updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const allowed = ['pendiente', 'enviada', 'opcionada', 'rechazada', 'sospechosa'];

    if (!allowed.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const cotizacion = await Cotizacion.findByPk(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'Cotización no encontrada' });

    await cotizacion.update({ estado });

    return res.json({ message: 'Estado actualizado', cotizacion });
  } catch (err) {
    console.error('❌ ERROR ACTUALIZANDO ESTADO:', err);
    return res.status(500).json({ message: 'Error actualizando estado' });
  }
};

exports.deleteCotizacion = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByPk(req.params.id);
    if (!cotizacion) return res.status(404).json({ message: 'Cotización no encontrada' });

    await cotizacion.destroy();
    return res.json({ message: 'Cotización eliminada' });
  } catch (err) {
    console.error('❌ ERROR ELIMINANDO COTIZACION:', err);
    return res.status(500).json({ message: 'Error eliminando cotización' });
  }
};
