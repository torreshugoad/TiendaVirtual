const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
router.use(auth);

const Producto = require('../models/Producto');

/* ==========================
   OBTENER STOCK
========================== */

router.get('/', async (req, res) => {

  try {

    const productos =

      await Producto.find()

        .populate('categoria');

    const filas = [];

    productos.forEach(producto => {

      producto.variantes.forEach(variante => {

        filas.push({

          productoId:
            producto._id,

          varianteId:
            variante._id,

          categoria:
            producto.categoria?.nombre || '',

          producto:
            producto.nombre,

          peso:
            variante.peso,

          precio:
            Number(
              variante.precio || 0
            ),

          stock:
            Number(
              variante.stock || 0
            ),

          stockMinimo:
            Number(
              variante.stockMinimo ?? 5
            ),

          tipoStock:
            producto.tipoStock,

          // Mongo guarda gramos.
          // El administrador ve Kg.

          stockGranel:

            Number(
              producto.stockGranel || 0
            ) / 1000,

          stockMinimoGranel:

            Number(
              producto.stockMinimoGranel ?? 2000
            ) / 1000

        });

      });

    });

    res.json(filas);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      error:
        'Error obteniendo stock'

    });

  }

});

/* ==========================
   GUARDAR CAMBIOS
========================== */

router.put('/', async (req, res) => {

  try {

    const { filas } = req.body;

    for (const fila of filas) {

      const producto =

        await Producto.findById(

          fila.productoId

        );

      if (!producto) {

        continue;

      }

      /* ==========================
         STOCK GRANEL
      ========================== */

      if (

        producto.tipoStock === 'granel'

      ) {

        producto.stockGranel =

          Math.round(

            Number(

              fila.stockGranel || 0

            ) * 1000

          );

        producto.stockMinimoGranel =

          Math.round(

            Number(

              fila.stockMinimoGranel || 0

            ) * 1000

          );

      }

      /* ==========================
         VARIANTE
      ========================== */

      const variante =

        producto.variantes.id(

          fila.varianteId

        );

      if (variante) {

        variante.precio =

          Number(

            fila.precio || 0

          );

        if (

          producto.tipoStock !== 'granel'

        ) {

          variante.stock =

            Number(

              fila.stock || 0

            );

          variante.stockMinimo =

            Number(

              fila.stockMinimo ?? 5

            );

        }

      }

      await producto.save({
        validateModifiedOnly: true
      });

    }

    res.json({

      success: true

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({

      error:
        'Error guardando stock'

    });

  }

});

module.exports = router;