const Plato = require("../models/Plato");
const PlatoIngrediente = require("../models/PlatoIngrediente");
const Product = require("../models/product.model");

// Crear plato con ingredientes
exports.createPlato = async (req, res) => {
    try {
        const { nombre, descripcion, precio_venta, jefe_id, ingredientes } = req.body;

        if (!ingredientes || ingredientes.length === 0) {
            return res.status(400).json({ error: "Debe agregar mínimo 1 ingrediente" });
        }

        // Crear plato con todos los campos obligatorios
        const plato = await Plato.create({ nombre, descripcion, precio_venta, jefe_id });

        // Crear ingredientes asociados
        for (const ing of ingredientes) {
            await PlatoIngrediente.create({
                plato_id: plato.id,
                producto_id: ing.productId,
                cantidad: ing.cantidad,
                unidad: ing.unidad || "unidad"
            });
        }

        res.status(201).json({ message: "Plato creado correctamente", plato });
    } catch (error) {
        console.error(error);
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                error: "Error de validación",
                details: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ error: "Error creando plato" });
    }
};

// Listar todos los platos con ingredientes y productos
exports.getPlatos = async (req, res) => {
    try {
        const platos = await Plato.findAll({
            include: {
                model: PlatoIngrediente,
                as: 'ingredientes',          // ⚠️ alias correcto
                include: {
                    model: Product,
                    as: 'producto'           // ⚠️ alias correcto
                }
            }
        });

        res.json(platos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo platos" });
    }
};

// Plato por ID
exports.getPlatoById = async (req, res) => {
    try {
        const plato = await Plato.findByPk(req.params.id, {
            include: {
                model: PlatoIngrediente,
                as: 'ingredientes',
                include: {
                    model: Product,
                    as: 'producto'
                }
            }
        });

        if (!plato) return res.status(404).json({ error: "Plato no encontrado" });

        res.json(plato);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo plato" });
    }
};

// Editar plato
exports.updatePlato = async (req, res) => {
    try {
        const { nombre, descripcion, precio_venta, jefe_id, ingredientes } = req.body;

        const plato = await Plato.findByPk(req.params.id);
        if (!plato) return res.status(404).json({ error: "Plato no encontrado" });

        await plato.update({ nombre, descripcion, precio_venta, jefe_id });

        // Resetear ingredientes
        await PlatoIngrediente.destroy({ where: { plato_id: plato.id } });

        for (const ing of ingredientes) {
            await PlatoIngrediente.create({
                plato_id: plato.id,
                producto_id: ing.productId,
                cantidad: ing.cantidad,
                unidad: ing.unidad || "unidad"
            });
        }

        res.json({ message: "Plato actualizado", plato });
    } catch (error) {
        console.error(error);
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                error: "Error de validación",
                details: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ error: "Error actualizando plato" });
    }
};

// Eliminar plato
exports.deletePlato = async (req, res) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) return res.status(404).json({ error: "Plato no encontrado" });

        await PlatoIngrediente.destroy({ where: { plato_id: plato.id } });
        await plato.destroy();

        res.json({ message: "Plato eliminado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error eliminando plato" });
    }
};
