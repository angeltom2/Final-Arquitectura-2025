const Plato = require("../models/Plato");
const PlatoIngrediente = require("../models/PlatoIngrediente");
const Product = require("../models/product.model");

// Crear plato con ingredientes
exports.createPlato = async (req, res) => {
    try {
        const { nombre, descripcion, ingredientes } = req.body;

        if (!ingredientes || ingredientes.length === 0) {
            return res.status(400).json({ error: "Debe agregar mínimo 1 ingrediente" });
        }

        const plato = await Plato.create({ nombre, descripcion });

        for (const ing of ingredientes) {
            await PlatoIngrediente.create({
                platoId: plato.id,
                productId: ing.productId,
                cantidad: ing.cantidad
            });
        }

        res.json({ message: "Plato creado correctamente", plato });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creando plato" });
    }
};

// Listar platos
exports.getPlatos = async (req, res) => {
    try {
        const platos = await Plato.findAll({
            include: {
                model: PlatoIngrediente,
                include: { model: Product }
            }
        });

        res.json(platos);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo platos" });
    }
};

// Plato por ID
exports.getPlatoById = async (req, res) => {
    try {
        const plato = await Plato.findByPk(req.params.id, {
            include: {
                model: PlatoIngrediente,
                include: Product
            }
        });

        if (!plato) return res.status(404).json({ error: "Plato no encontrado" });

        res.json(plato);
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo plato" });
    }
};

// Editar plato
exports.updatePlato = async (req, res) => {
    try {
        const { nombre, descripcion, ingredientes } = req.body;

        const plato = await Plato.findByPk(req.params.id);
        if (!plato) return res.status(404).json({ error: "Plato no encontrado" });

        await plato.update({ nombre, descripcion });

        // Resetear ingredientes
        await PlatoIngrediente.destroy({ where: { platoId: plato.id } });

        for (const ing of ingredientes) {
            await PlatoIngrediente.create({
                platoId: plato.id,
                productId: ing.productId,
                cantidad: ing.cantidad
            });
        }

        res.json({ message: "Plato actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error actualizando plato" });
    }
};

// Eliminar
exports.deletePlato = async (req, res) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) return res.status(404).json({ error: "Plato no encontrado" });

        await PlatoIngrediente.destroy({ where: { platoId: plato.id } });
        await plato.destroy();

        res.json({ message: "Plato eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error eliminando plato" });
    }
};
