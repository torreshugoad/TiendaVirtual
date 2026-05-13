const express = require('express');

const router = express.Router();

const Pedido = require('../models/Pedido');

const Producto = require('../models/Producto');


// OBTENER PEDIDOS

router.get('/', async (req, res) => {

  try {

    const pedidos =
      await Pedido.find()
      .sort({ fecha: -1 });

    res.json(pedidos);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:
        'Error al obtener pedidos'
    });
  }
});


// CREAR PEDIDO

router.post('/', async (req, res) => {

  try {

    const pedido =
      new Pedido(req.body);

    await pedido.save();

    res.json({
      ok: true
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:
        'Error al guardar pedido'
    });
  }
});


// DESCONTAR STOCK

router.post(
  '/descontar-stock',
  async (req, res) => {

    try {

      const items =
        req.body.items || [];

      for (const item of items) {

        const producto =
          await Producto.findById(
            item.productoId
          );

        if (!producto) continue;

        // STOCK NORMAL

        if (
          producto.tipoStock !== 'granel'
        ) {

          const variante =
            producto.variantes.find(
              v =>
                v.peso === item.peso
            );

          if (variante) {

            variante.stock -=
              Number(item.cantidad);
          }

        } else {

          // STOCK GRANEL

          let kg = 0;

          const texto =
            item.peso
              .toLowerCase()
              .replace(/\s/g, '');

          if (
            texto.includes('kg')
          ) {

            kg =
              Number(
                texto.replace(
                  'kg',
                  ''
                )
              );

          } else if (
            texto.includes('gr')
          ) {

            kg =
              Number(
                texto.replace(
                  'gr',
                  ''
                )
              ) / 1000;

          } else {

            kg =
              Number(texto) / 1000;
          }

          producto.stockGranelKg -=
            kg *
            Number(item.cantidad);
        }

        await producto.save();
      }

      res.json({
        ok: true
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error:
          'Error al descontar stock'
      });
    }
  }
);

router.put('/:id', async (req, res) => {

  try {

    const { estado } = req.body;

    const pedido =
      await Pedido.findByIdAndUpdate(

        req.params.id,

        {
          estado,

          confirmacionEnviada:
            estado ===
            'Confirmación enviada'
        },

        {
          new: true
        }
      );

    res.json(pedido);

  } catch (error) {

    console.log(error);

    res.status(500).json({

      error:
        'Error actualizando pedido'
    });
  }
});

module.exports = router;