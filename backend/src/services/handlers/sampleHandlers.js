module.exports = {
  GetGreeting: async ({ name }) => {
    return `¡Hola ${name}! Esto es una respuesta desde el Mediator (backend).`;
  }
};
