/**
 * Mediator simple para manejo de comandos/queries.
 * Registro de handlers por nombre de 'type' y dispatch con send().
 */

const handlers = new Map();

module.exports = {
  register: (type, fn) => {
    handlers.set(type, fn);
  },
  registerHandlers: (obj) => {
    // obj: { GetGreeting: async (payload)=>... }
    Object.entries(obj).forEach(([k,v]) => handlers.set(k, v));
  },
  send: async (message) => {
    // message: { type: 'Name', payload: {} }
    const fn = handlers.get(message.type);
    if (!fn) throw new Error(`No handler for type=${message.type}`);
    return fn(message.payload || {});
  }
};
