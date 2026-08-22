const Producto = require('../models/Producto');

exports.obtenerProductos = async (req, res) => {
  try {
    // Paginación: ?pagina=1&limite=50 (por defecto). Antes traía TODO el
    // catálogo sin límite en cada request; con pocos productos no se nota,
    // pero es la causa típica de que el listado se ponga lento a medida que
    // crece el catálogo.
    const pagina = Math.max(parseInt(req.query.pagina) || 1, 1);
    const limite = Math.min(parseInt(req.query.limite) || 50, 100);

    const [productos, total] = await Promise.all([
      Producto.find({ activo: true })
        .sort({ orden: 1 })
        .skip((pagina - 1) * limite)
        .limit(limite)
        // .lean(): devuelve objetos JS planos en vez de documentos Mongoose
        // completos. Como acá solo se leen y se devuelven como JSON, no hace
        // falta pagar el costo de hidratar cada uno con sus métodos.
        .lean(),
      Producto.countDocuments({ activo: true })
    ]);

    res.json({
      productos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite)
    });
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
