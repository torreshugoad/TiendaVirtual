const express =
  require('express');

const router =
  express.Router();

const Producto =
  require('../models/Producto');

const Pedido =
  require('../models/Pedido');

const {
  kgAGramos,
  descontarStock
} = require('../utils/stock');

router.post(
  '/',
  async (req, res) => {

    try {

      const {

        cliente,
        telefono,
        direccion,
        tipoEntrega,
        envio,
        items

      } = req.body;

      if (!items || items.length === 0) {

        return res.status(400).json({

          mensaje: 'Carrito vacío'

        });

      }

      let subtotal = 0;

      /* ==========================
         VALIDAR STOCK
      ========================== */

      for (const item of items) {

        const producto =
          await Producto.findById(
            item.productoId
          );

        if (!producto) {

          return res.status(404).json({

            mensaje: 'Producto no encontrado'

          });

        }

        const variante =
          producto.variantes.find(

            v => v.peso === item.peso

          );

        if (!variante) {

          return res.status(404).json({

            mensaje: 'Variante no encontrada'

          });

        }

        if (producto.tipoStock !== 'granel') {

          if (

            Number(variante.stock) <

            Number(item.cantidad)

          ) {

            return res.status(400).json({

              mensaje:
                `${producto.nombre} sin stock suficiente`

            });

          }

        } else {

          const kgNecesarios =

            Number(
              variante.equivalenciaKg || 0
            );

          const stockDisponible =

            kgAGramos(
              producto.stockGranelKg
            );

          const solicitado =

            kgAGramos(

              kgNecesarios *

              item.cantidad

            );

          if (

            solicitado >

            stockDisponible

          ) {

            return res.status(400).json({

              mensaje:
                `${producto.nombre} sin stock suficiente`

            });

          }

        }

        subtotal +=

          Number(item.precio) *

          Number(item.cantidad);

      }

      /* ==========================
         DESCONTAR STOCK
      ========================== */

      for (const item of items) {

        const producto =
          await Producto.findById(
            item.productoId
          );

        const variante =
          producto.variantes.find(

            v => v.peso === item.peso

          );

        if (producto.tipoStock !== 'granel') {

          variante.stock -=
            Number(item.cantidad);

        } else {

          const kgNecesarios =

            Number(
              variante.equivalenciaKg || 0
            );

          producto.stockGranelKg =

            descontarStock(

              producto.stockGranelKg,

              kgNecesarios *

              item.cantidad

            );

        }

        await producto.save();

      }

      /* ==========================
         NÚMERO DE PEDIDO
      ========================== */

      const ultimoPedido =
        await Pedido.findOne()
          .sort({
            fecha: -1
          });

      let nuevoNumero = 1;

      if (

        ultimoPedido &&
        ultimoPedido.nropedido

      ) {

        nuevoNumero =

          Number(
            ultimoPedido.nropedido
          ) + 1;

      }

      /* ==========================
         ITEMS
      ========================== */

      const itemsPedido =
        items.map(item => ({

          productoId:
            item.productoId,

          nombre:
            item.nombre,

          foto:
            item.foto,

          peso:
            item.peso,

          precio:
            item.precio,

          cantidad:
            item.cantidad,

          subtotal:

            Number(item.precio) *

            Number(item.cantidad)

        }));

      const total =

        subtotal +

        Number(envio || 0);

      /* ==========================
         CREAR PEDIDO
      ========================== */

      const pedido =
        new Pedido({

          nropedido:
            String(nuevoNumero),

          cliente,

          telefono,

          direccion,

          tipoEntrega,

          envio:
            Number(envio || 0),

          items:
            itemsPedido,

          subtotal,

          total

        });

      await pedido.save();

      res.json({

        success: true,

        pedidoId:
          pedido._id,

        nropedido:
          pedido.nropedido

      });

    } catch (error) {

      console.error(error);

      res.status(500).json({

        mensaje:
          'Error en checkout'

      });

    }

  }

);

module.exports = router;