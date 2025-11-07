const { Router } = require('express');
const router = Router();

const health = (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
router.get('/health', health);

// Mediator y handlers
const mediator = require('../services/mediator');
const sampleHandlers = require('../services/handlers/sampleHandlers');
const productHandlers = require('../services/handlers/productHandlers');

mediator.registerHandlers(sampleHandlers);
mediator.registerHandlers(productHandlers);

// Ejemplo que usa el mediator de backend
router.get('/example', async (req, res) => {
  try {
    const result = await mediator.send({ type: 'GetGreeting', payload: { name: 'Chef' } });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENDPOINTS DE PRUEBA PARA DB
// Crear producto (POST /api/productos)
router.post('/productos', async (req, res) => {
  try {
    const data = req.body;
    const result = await mediator.send({ type: 'CreateProducto', payload: { data } });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar productos (GET /api/productos)
router.get('/productos', async (req, res) => {
  try {
    const result = await mediator.send({ type: 'ListProductos' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint rápido de test (crea un producto y lista)
router.get('/db-test', async (req, res) => {
  try {
    const p = await mediator.send({
      type: 'CreateProducto',
      payload: { data: { nombre: 'Prueba arroz', categoria: 'Cereal', cantidad: 10, unidad: 'Kg', precio_sugerido: 12.5 } }
    });
    const list = await mediator.send({ type: 'ListProductos' });
    res.json({ created: p, productos: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
