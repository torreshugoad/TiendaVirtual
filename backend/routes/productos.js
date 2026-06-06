const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

/* TODOS LOS PRODUCTOS */

router.get('/',
async (req, res) => {

  try {

    const productos =
      await Producto.find()
        .populate('categoria')
        .sort({ orden: 1 });

    res.json(productos);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      mensaje:
        'Error al obtener productos'
    });
  }
});

/* PRODUCTOS POR CATEGORIA */

router.get(
  '/categoria/:id',

  async (req, res) => {

    try {

      const productos =

        await Producto.find({

          categoria:
            req.params.id

        })
        .populate('categoria')
        .sort({ orden: 1 });

      res.json(productos);

    } catch (error) {

      console.log(error);

      res.status(500).json({

        mensaje:
          'Error al obtener productos'

      });
    }
  }
);

/* CREAR PRODUCTO */

router.post('/',
async (req, res) => {

  try {

    const producto =
      new Producto(req.body);

    await producto.save();

    res.json(producto);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al crear producto'

    });
  }
});

/* ELIMINAR PRODUCTO */

router.delete('/:id',
async (req, res) => {

  try {

    await Producto.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al eliminar producto'

    });
  }
});

/* EDITAR PRODUCTO */

router.put('/:id',
async (req, res) => {

  try {

    const producto =

      await Producto.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true
        }

      );

    res.json(producto);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      mensaje:
        'Error al editar producto'

    });
  }
});

module.exports = router;