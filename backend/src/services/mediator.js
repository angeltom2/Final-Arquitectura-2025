// backend/src/services/mediator.js
// Este es un Mediator básico temporal para evitar errores de importación.

class Mediator {
  constructor() {
    this.handlers = {};
  }

  registerHandlers(handlers) {
    Object.assign(this.handlers, handlers);
  }

  async send(request) {
    const handler = this.handlers[request.type];
    if (!handler) throw new Error(`No existe un handler para el tipo: ${request.type}`);
    return handler(request.payload);
  }
}

module.exports = new Mediator();
