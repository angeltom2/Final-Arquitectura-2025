/**
 * Mediator frontend simple: envía requests HTTP al backend según 'type'.
 * Para un proyecto real podrías usar patterns más sofisticados (EventBus, CQRS, Redux middleware).
 */

import api from './api';

const handlers = {
  GetGreeting: async ({ name }) => {
    // Llamada al endpoint /api/example del backend que usa el mediator en el servidor
    const res = await api.instance.get('/example');
    // el backend devuelve { result: '...' }
    return res.data.result;
  }
};

export default {
  send: async (message) => {
    const fn = handlers[message.type];
    if (!fn) throw new Error(`No handler frontend para type=${message.type}`);
    return fn(message.payload || {});
  }
};
