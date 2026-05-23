const express = require('express');

const router = express.Router();

const Producto =
  require('../models/Producto');

router.post(
  '/',
  async (req, res) => {

    try {

      const {
        productoId,
        peso
      } = req.body;

      if (
        !productoId ||
        !peso
      ) {

        return res.status(400).json({
          error:
            'Datos incompletos'
        });
      }

      const producto =
        await Producto.findById(
          productoId
        );

      if (!producto) {

        return res.status(404).json({
          error:
            'Producto no encontrado'
        });
      }

      const variante =
        producto.variantes.find(
          v =>

            v.peso
              ?.toLowerCase()
              .replace(/\s/g, '') ===

            peso
              ?.toLowerCase()
              .replace(/\s/g, '')
        );

      if (!variante) {

        return res.status(404).json({
          error:
            'Variante no encontrada'
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

      res.json({
        stock:
          stockDisponible
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          'Error obteniendo stock'
      });
    }
  }
);

module.exports = router;