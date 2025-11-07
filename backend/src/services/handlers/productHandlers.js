const Producto = require('../../models/product.model');

module.exports = {
  CreateProducto: async ({ data }) => {
    const p = await Producto.create(data);
    return p.toJSON();
  },

  ListProductos: async () => {
    const list = await Producto.findAll({ limit: 50, order: [['id','DESC']] });
    return list.map(x => x.toJSON());
  }
};