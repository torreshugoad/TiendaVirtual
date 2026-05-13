
const Producto = require('../models/Producto');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find({ activo: true });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.crearProducto = async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
