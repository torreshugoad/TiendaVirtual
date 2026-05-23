const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

router.post(
  '/',
  async (req, res) => {

    try {

      const { carrito } =
        req.body;

      if (
        !Array.isArray(carrito)
      ) {

        return res.status(400).json({
          error:
            'Carrito inválido'
        });
      }

      for (const item of carrito) {

        const producto =
          await Producto.findById(
            item.productoId
          );

        if (!producto) {

          return res.status(404).json({
            error:
              `Producto no encontrado: ${item.nombre}`
          });
        }

        const variante =
          producto.variantes.find(
            v =>

              v.peso ===
              item.peso
          );

        if (!variante) {

          return res.status(404).json({
            error:
              `Variante no encontrada: ${item.peso}`
          });
        }

        let stockDisponible = 0;

        if (
          producto.tipoStock ===
          'granel'
        ) {

          let kgNecesarios = 0;

          const texto =
            variante.peso
              .toLowerCase()
              .replace(/\s/g, '');

          if (
            texto.includes('kg')
          ) {

            kgNecesarios =
              Number(
                texto.replace(
                  'kg',
                  ''
                )
              );

          } else if (
            texto.includes('gr')
          ) {

            kgNecesarios =
              Number(
                texto.replace(
                  'gr',
                  ''
                )
              ) / 1000;

          } else {

            kgNecesarios =
              Number(texto) / 1000;
          }

          stockDisponible =
            Math.floor(

              Number(
                producto.stockGranelKg || 0
              ) / kgNecesarios
            );

        } else {

          stockDisponible =
            Number(
              variante.stock || 0
            );
        }

        if (
          Number(item.cantidad) >
          stockDisponible
        ) {

          return res.status(400).json({
            error:
              `Stock insuficiente para ${item.nombre} ${item.peso}`
          });
        }
      }

      res.json({
        ok: true
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          'Error verificando stock'
      });
    }
  }
);

module.exports = router;