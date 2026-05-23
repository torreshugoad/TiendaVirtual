const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

/* =========================
   OBTENER STOCK
========================= */

router.get(
  '/',
  async (req, res) => {

    try {

      const productos =
        await Producto.find()
          .populate('categoria');

      const filas = [];

      productos.forEach(
        producto => {

          producto.variantes.forEach(
            variante => {

              filas.push({

                productoId:
                  producto._id,

                varianteId:
                  variante._id,

                categoria:
                  producto.categoria
                    ?.nombre || '',

                producto:
                  producto.nombre,

                peso:
                  variante.peso,

                precio:
                  variante.precio,

                stock:
                  variante.stock || 0,

                tipoStock:
                  producto.tipoStock,

                stockGranelKg:
                  producto.stockGranelKg || 0
              });
            }
          );
        }
      );

      res.json(filas);

    } catch (error) {

      console.log(error);

      res.status(500).json({

        error:
          'Error obteniendo stock'
      });
    }
  }
);

/* =========================
   GUARDAR CAMBIOS
========================= */

router.put(
  '/',
  async (req, res) => {

    try {

      const { filas } =
        req.body;

      for (const fila of filas) {

        const producto =
          await Producto.findById(
            fila.productoId
          );

        if (!producto) {
          continue;
        }

        /* STOCK GRANEL */

        if (
          producto.tipoStock ===
          'granel'
        ) {

          producto.stockGranelKg =
            Number(
              fila.stockGranelKg || 0
            );
        }

        /* VARIANTE */

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
            producto.tipoStock !==
            'granel'
          ) {

            variante.stock =
              Number(
                fila.stock || 0
              );
          }
        }

        await producto.save();
      }

      res.json({
        success: true
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        error:
          'Error guardando stock'
      });
    }
  }
);

module.exports = router;