const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');

const Producto = require('../models/Producto');

/* ==========================
   NORMALIZAR PRODUCTO
========================== */

function normalizarProducto(data) {

  return {

    nombre:
      data.nombre?.trim(),

    foto:
      data.foto || '',

    categoria:
      data.categoria,

    descripcion:
      data.descripcion || '',

    orden:
      Number(data.orden || 0),

    activo:

      data.activo === undefined

        ? true

        : Boolean(data.activo),

    tipoStock:
      data.tipoStock || 'unidad',

    // Siempre en gramos

    stockGranel:
      Number(data.stockGranel || 0),

    // Siempre en gramos (umbral de alerta)

    stockMinimoGranel:
      Number(data.stockMinimoGranel || 0),

    // Solo se usa cuando tipoStock === 'combo'

    precioCombo:
      Number(data.precioCombo || 0),

    // Solo se usa cuando tipoStock === 'combo'

    componentes:

      (data.componentes || [])

        .filter(c => c.productoId)

        .map(c => ({

          productoId:
            c.productoId,

          cantidadGramos:
            Number(c.cantidadGramos || 0)

        })),

    variantes:

      (data.variantes || []).map(v => ({

        peso:
          v.peso,

        precio:
          Number(v.precio || 0),

        stock:
          Number(v.stock || 0),

        // Umbral de alerta por variante

        stockMinimo:
          Number(v.stockMinimo || 0),

        // Siempre en gramos

        equivalencia:
          Number(v.equivalencia || 0)

      }))

  };

}

/* ==========================
   TODOS LOS PRODUCTOS
========================== */

router.get('/', async (req, res) => {

  try {

    // El catálogo público pide ?activo=true para no mostrar
    // productos ocultos/descontinuados. El admin llama sin el
    // parámetro y sigue viendo todo, para poder reactivarlos.

    const filtro = {};

    if (req.query.activo === 'true') {

      filtro.activo = true;
    }

    const productos =

      await Producto.find(filtro)

        .populate('categoria')

        .sort({ orden: 1 });

    res.json(productos);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al obtener productos'

    });

  }

});

/* ==========================
   PRODUCTOS POR CATEGORIA
========================== */

router.get('/categoria/:id', async (req, res) => {

  try {

    const filtro = {

      categoria:
        req.params.id

    };

    if (req.query.activo === 'true') {

      filtro.activo = true;
    }

    const productos =

      await Producto.find(filtro)

      .populate('categoria')

      .sort({

        orden: 1

      });

    res.json(productos);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al obtener productos'

    });

  }

});

/* ==========================
   CREAR PRODUCTO
========================== */

router.post('/', auth, async (req, res) => {

  try {

    const producto =

      new Producto(

        normalizarProducto(req.body)

      );

    await producto.save();

    const resultado =

      await Producto.findById(producto._id)

        .populate('categoria');

    res.json(resultado);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al crear producto'

    });

  }

});

/* ==========================
   EDITAR PRODUCTO
========================== */

router.put('/:id', auth, async (req, res) => {

  try {

    await Producto.findByIdAndUpdate(

      req.params.id,

      normalizarProducto(req.body)

    );

    const producto =

      await Producto.findById(req.params.id)

        .populate('categoria');

    res.json(producto);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al editar producto'

    });

  }

});

/* ==========================
   ELIMINAR PRODUCTO
========================== */

router.delete('/:id', auth, async (req, res) => {

  try {

    await Producto.findByIdAndDelete(

      req.params.id

    );

    res.json({

      success: true

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al eliminar producto'

    });

  }

});

module.exports = router;