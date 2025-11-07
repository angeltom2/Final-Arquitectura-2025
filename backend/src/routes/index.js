const { Router } = require('express');
const router = Router();

const health = (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
router.get('/health', health);

// Example: mediator usage - send commands / queries via mediator
const mediator = require('../services/mediator');
const sampleHandlers = require('../services/handlers/sampleHandlers');

mediator.registerHandlers(sampleHandlers);

router.get('/example', async (req, res) => {
  try {
    const result = await mediator.send({ type: 'GetGreeting', payload: { name: 'Chef' } });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
